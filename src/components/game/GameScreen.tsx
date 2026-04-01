import { useEffect, useCallback } from 'react'
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
import type { Difficulty } from '@/shared/types'

interface Props {
  givens: string
  puzzleId: string
  sessionToken: string
  difficulty: Difficulty
  isDaily?: boolean
  dailyDate?: string
  onPlayAgain: () => void
  onViewResults?: () => void
}

export function GameScreen({ givens, puzzleId, sessionToken, difficulty, isDaily = false, dailyDate, onPlayAgain, onViewResults }: Props) {
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

  useKeyboard(null)

  useEffect(() => {
    const saved = useGameStore.getState()
    const isRestoring =
      saved.puzzleId === puzzleId &&
      (saved.status === 'playing' || saved.status === 'paused')

    if (isRestoring) {
      startTimer(sessionToken, useTimerStore.getState().elapsed)
    } else {
      initGame({ givens, puzzleId, sessionToken, difficulty })
      startTimer(sessionToken)
    }

    return () => {
      const status = useGameStore.getState().status
      if (status !== 'playing' && status !== 'paused') {
        resetGame()
        resetTimer()
      } else {
        useTimerStore.getState().pause()
      }
    }
  }, [puzzleId]) // eslint-disable-line react-hooks/exhaustive-deps

  // Stop timer on completion or failure
  useEffect(() => {
    if (status === 'complete' || status === 'failed') pauseTimer()
  }, [status]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleHint = useCallback(async () => {
    const currentBoard = cells.map((c) => c.value ?? 0).join('')
    try {
      const res = await api.post<{ index: number; digit: number }>('/api/puzzle/hint', {
        sessionToken,
        currentBoard,
      })
      useHint(res.index, res.digit)
    } catch {
      // ignore
    }
  }, [sessionToken, cells, useHint])

  function handleRestart() {
    resetGame()
    resetTimer()
    initGame({ givens, puzzleId, sessionToken, difficulty })
    startTimer(sessionToken)
  }

  const dailyLabel = dailyDate
    ? new Date(dailyDate).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
    : new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })

  const config = DIFFICULTY_CONFIG[difficulty]
  const boardMaxW = 'max-w-[min(90vw,calc(90vh-280px),480px)] lg:max-w-[min(calc(100vh-200px),560px)]'

  return (
    <div className="flex flex-col lg:flex-row items-center lg:items-start justify-center gap-6 px-4 py-4 w-full max-w-5xl mx-auto">

      {/* Board column */}
      <div className={`flex flex-col items-stretch gap-3 w-full ${boardMaxW}`}>
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold" style={{ color: config.color }}>
              {config.label}
            </span>
            {isDaily && (
              <span className="flex items-center gap-1 text-xs font-semibold px-1.5 py-0.5 rounded-full bg-(--color-primary)/10 text-(--color-primary)">
                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <rect x="3" y="4" width="18" height="18" rx="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                {dailyLabel}
              </span>
            )}
          </div>
          <div className="text-xl font-mono font-bold text-(--color-text) tabular-nums">
            {formatTime(elapsed)}
          </div>
          <ErrorBanner errors={errors} />
        </div>

        <SudokuBoard onRestart={handleRestart} />

        {/* Mobile controls */}
        <div className="lg:hidden flex flex-col items-center gap-4 w-full mt-1">
          <ActionBar onHint={handleHint} onRestart={handleRestart} />
          <NumberPad />
        </div>
      </div>

      {/* Desktop controls */}
      <div className="hidden lg:flex flex-col gap-5 w-80 shrink-0 pt-10">
        <ActionBar onHint={handleHint} onRestart={handleRestart} />
        <NumberPad />
      </div>

      {/* Completion modal — shown immediately, save already fired in background */}
      {status === 'complete' && (
        <CompletionModal
          difficulty={difficulty}
          elapsedSeconds={elapsed}
          hintsUsed={hintsUsed}
          errorsMade={errors}
          adjustedTime={calculateAdjustedTime(elapsed, hintsUsed, errors)}
          rank={null}
          isDaily={isDaily}
          onPlayAgain={onPlayAgain}
          onHome={() => navigate('/')}
          onViewResults={onViewResults}
        />
      )}
    </div>
  )
}
