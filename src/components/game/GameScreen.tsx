import { useEffect, useState, useCallback, useRef } from 'react'
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
  const [submitted, setSubmitted] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const submittingRef = useRef(false)

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

  // Parar el cronómetro al terminar o fallar
  useEffect(() => {
    if (status === 'complete' || status === 'failed') pauseTimer()
  }, [status]) // eslint-disable-line react-hooks/exhaustive-deps

  // Submit completion to server
  const submitCompletion = useCallback(async () => {
    if (submittingRef.current) return
    submittingRef.current = true
    setSubmitError(null)
    setSubmitted(false)

    // Read fresh values from stores to avoid stale closures
    const currentCells = useGameStore.getState().cells
    const currentElapsed = useTimerStore.getState().elapsed
    const currentHints = useGameStore.getState().hintsUsed
    const currentErrors = useGameStore.getState().errors

    const board = currentCells.map((c) => c.value ?? 0).join('')
    try {
      const result = await api.post<CompletionResult>('/api/puzzle/validate', {
        sessionToken,
        board,
        elapsedSeconds: currentElapsed,
        hintsUsed: currentHints,
        errorsMade: currentErrors,
      })
      setCompletionResult(result)
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Error desconocido'
      console.error('[sudoku] Error al guardar partida:', msg)
      setSubmitError(msg)
    } finally {
      submittingRef.current = false
      setSubmitted(true)
    }
  }, [sessionToken])

  // Auto-submit on completion
  useEffect(() => {
    if (status !== 'complete') {
      setSubmitted(false)
      setSubmitError(null)
      return
    }
    submitCompletion()
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
    setCompletionResult(null)
    setSubmitted(false)
    setSubmitError(null)
    initGame({ givens, puzzleId, sessionToken, difficulty })
    startTimer(sessionToken)
  }

  const config = DIFFICULTY_CONFIG[difficulty]

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
        <SudokuBoard onRestart={handleRestart} />

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

      {/* Saving spinner while submitting completion */}
      {status === 'complete' && !submitted && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
          <div className="flex flex-col items-center gap-3 bg-(--color-surface) rounded-2xl px-8 py-6 shadow-xl">
            <div className="w-8 h-8 border-4 border-(--color-primary) border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-(--color-text-muted)">Guardando partida...</p>
          </div>
        </div>
      )}

      {status === 'complete' && submitted && submitError && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-(--color-surface) rounded-2xl shadow-2xl p-8 w-full max-w-sm text-center">
            <div className="text-4xl mb-4">⚠️</div>
            <h2 className="text-xl font-bold text-(--color-text) mb-2">Error al guardar</h2>
            <p className="text-sm text-(--color-text-muted) mb-6">{submitError}</p>
            <div className="flex gap-3">
              <button
                onClick={() => navigate('/')}
                className="flex-1 py-3 rounded-xl border-2 border-(--color-border) text-(--color-text) font-semibold hover:bg-(--color-surface-alt) transition-colors"
              >
                Inicio
              </button>
              <button
                onClick={submitCompletion}
                className="flex-1 py-3 rounded-xl bg-(--color-primary) text-white font-semibold hover:opacity-90 transition-opacity"
              >
                Reintentar
              </button>
            </div>
          </div>
        </div>
      )}

      {status === 'complete' && submitted && !submitError && (
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
