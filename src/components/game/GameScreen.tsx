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
import { formatTime, calculateAdjustedTime } from '@/shared/scoring'
import { DIFFICULTY_CONFIG } from '@/shared/constants'
import { api } from '@/lib/api'
import type { Difficulty, CompletionResult } from '@/shared/types'

interface Props {
  givens: string
  puzzleId: string
  sessionToken: string
  difficulty: Difficulty
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
  const pauseTimer = useTimerStore((s) => s.pause)
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

  useEffect(() => {
    if (status !== 'complete') return

    // Parar el cronómetro inmediatamente
    pauseTimer()

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
        // El modal se muestra igualmente con datos locales
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
    setCompletionResult(null)
    initGame({ givens, puzzleId, sessionToken, difficulty })
    startTimer(sessionToken)
  }

  const config = DIFFICULTY_CONFIG[difficulty]

  // Shared board-column max-w classes (info row + board share the same constraint)
  const boardMaxW = 'max-w-[min(90vw,calc(90vh-280px),480px)] lg:max-w-[min(calc(100vh-200px),560px)]'

  return (
    <div className="flex flex-col lg:flex-row items-center lg:items-start justify-center gap-6 px-4 py-4 w-full max-w-5xl mx-auto">

      {/* ── Board column (both layouts) ── */}
      <div className={`flex flex-col items-stretch gap-3 w-full ${boardMaxW}`}>

        {/* Info row: level · timer · errors */}
        <div className="flex items-center justify-between w-full">
          <span className="text-sm font-semibold" style={{ color: config.color }}>
            {config.label}
          </span>
          <div className="text-xl font-mono font-bold text-(--color-text) tabular-nums">
            {formatTime(elapsed)}
          </div>
          <ErrorBanner errors={errors} />
        </div>

        {/* Board fills the column width */}
        <SudokuBoard />

        {/* Mobile-only controls below board */}
        <div className="lg:hidden flex flex-col items-center gap-4 w-full mt-1">
          <ActionBar onHint={handleHint} onRestart={handleRestart} />
          <NumberPad />
        </div>
      </div>

      {/* ── Right panel (desktop only) ── */}
      <div className="hidden lg:flex flex-col gap-5 w-80 shrink-0 pt-10">
        <ActionBar onHint={handleHint} onRestart={handleRestart} />
        <NumberPad />
      </div>

      {status === 'complete' && !syncing && (
        <CompletionModal
          difficulty={difficulty}
          elapsedSeconds={elapsed}
          hintsUsed={hintsUsed}
          errorsMade={errors}
          adjustedTime={completionResult?.adjustedTime ?? calculateAdjustedTime(elapsed, hintsUsed, errors)}
          rank={completionResult?.dailyRank ?? completionResult?.rank ?? null}
          onPlayAgain={() => handleRestart()}
          onHome={() => navigate('/')}
        />
      )}
    </div>
  )
}
