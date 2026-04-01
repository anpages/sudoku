import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { SudokuBoard } from '@/components/board/SudokuBoard'
import { NumberPad } from '@/components/controls/NumberPad'
import { ActionBar } from '@/components/controls/ActionBar'
import { ErrorBanner } from './ErrorBanner'
import { CompletionModal } from './CompletionModal'
import { useGameStore } from '@/store/game-store'
import { useTimerStore } from '@/store/timer-store'
import { useKeyboard } from '@/hooks/useKeyboard'
import { formatTime } from '@/shared/scoring'
import { DIFFICULTY_CONFIG } from '@/shared/constants'
import { api } from '@/lib/api'
import type { Difficulty, CompletionResult } from '@/shared/types'

interface Props {
  givens: string
  puzzleId: string
  sessionToken: string
  difficulty: Difficulty
}

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1 text-sm text-(--color-text-muted) hover:text-(--color-primary) transition-colors"
    >
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
        <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      Inicio
    </button>
  )
}

export function GameScreen({ givens, puzzleId, sessionToken, difficulty }: Props) {
  const navigate = useNavigate()
  const initGame = useGameStore((s) => s.initGame)
  const status = useGameStore((s) => s.status)
  const errors = useGameStore((s) => s.errors)
  const hintsUsed = useGameStore((s) => s.hintsUsed)
  const useHint = useGameStore((s) => s.useHint)
  const resetGame = useGameStore((s) => s.reset)
  const cells = useGameStore((s) => s.cells)

  const elapsed = useTimerStore((s) => s.elapsed)
  const startTimer = useTimerStore((s) => s.start)
  const resetTimer = useTimerStore((s) => s.reset)

  const [completionResult, setCompletionResult] = useState<CompletionResult | null>(null)
  const [syncing, setSyncing] = useState(false)

  useKeyboard(null)

  useEffect(() => {
    initGame({ givens, puzzleId, sessionToken, difficulty })
    startTimer(sessionToken)
    return () => {
      resetGame()
      resetTimer()
    }
  }, [puzzleId]) // eslint-disable-line react-hooks/exhaustive-deps

  // Submit completion when status becomes 'complete'
  useEffect(() => {
    if (status !== 'complete') return

    async function submit() {
      setSyncing(true)
      const board = cells.map((c) => c.value ?? 0).join('')
      try {
        const result = await api.post<CompletionResult>('/api/puzzle/validate', {
          sessionToken,
          board,
          elapsedSeconds: elapsed,
          hintsUsed,
          errorsMade: errors,
        })
        setCompletionResult(result)
      } catch {
        // silent — will retry on next visit
      } finally {
        setSyncing(false)
      }
    }
    submit()
  }, [status]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleHint = useCallback(async () => {
    const currentBoard = cells.map((c) => c.value ?? 0).join('')
    try {
      const res = await api.post<{ index: number; digit: number }>('/api/puzzle/hint', {
        sessionToken,
        currentBoard,
      })
      const partial = cells.map((c, i) =>
        i === res.index ? res.digit : (c.value ?? 0),
      ).join('')
      useHint(partial)
    } catch {
      // ignore
    }
  }, [sessionToken, cells, useHint])

  function handleRestart() {
    resetGame()
    resetTimer()
    initGame({ givens, puzzleId, sessionToken, difficulty })
    startTimer(sessionToken)
    setCompletionResult(null)
  }

  const config = DIFFICULTY_CONFIG[difficulty]

  return (
    <div className="flex flex-col items-center gap-4 px-4 py-4 w-full max-w-5xl mx-auto">

      {/* ── Mobile header row ── */}
      <div className="flex lg:hidden items-center justify-between w-full">
        <BackButton onClick={() => navigate('/')} />
        <span className="text-sm font-semibold" style={{ color: config.color }}>
          {config.label}
        </span>
        <div className="text-xl font-mono font-bold text-(--color-text) tabular-nums">
          {formatTime(elapsed)}
        </div>
        <ErrorBanner errors={errors} />
      </div>

      {/* ── Main content: board + right panel ── */}
      <div className="flex flex-col lg:flex-row items-center lg:items-start justify-center gap-6 w-full">

        {/* Board */}
        <SudokuBoard />

        {/* Right panel (desktop only) */}
        <div className="hidden lg:flex flex-col gap-5 min-w-[200px] pt-1">
          <BackButton onClick={() => navigate('/')} />

          <div>
            <div className="text-sm font-semibold mb-1" style={{ color: config.color }}>
              {config.label}
            </div>
            <div className="text-4xl font-mono font-bold text-(--color-text) tabular-nums leading-none">
              {formatTime(elapsed)}
            </div>
          </div>

          <ErrorBanner errors={errors} />

          <ActionBar onHint={handleHint} onRestart={handleRestart} />
        </div>
      </div>

      {/* ── Controls below board ── */}
      {/* Action bar: mobile only (desktop has it in right panel) */}
      <div className="lg:hidden w-full flex justify-center">
        <ActionBar onHint={handleHint} onRestart={handleRestart} />
      </div>

      <NumberPad />

      {status === 'complete' && !syncing && completionResult && (
        <CompletionModal
          difficulty={difficulty}
          elapsedSeconds={elapsed}
          hintsUsed={hintsUsed}
          errorsMade={errors}
          adjustedTime={completionResult.adjustedTime}
          rank={completionResult.dailyRank ?? completionResult.rank}
          onPlayAgain={() => handleRestart()}
          onHome={() => navigate('/')}
        />
      )}
    </div>
  )
}
