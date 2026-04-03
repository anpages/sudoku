import { useEffect, useState } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { GameScreen } from '@/components/game/GameScreen'
import { ErrorBoundary } from '@/components/ui/ErrorBoundary'
import { Header } from '@/components/layout/Header'
import { api } from '@/lib/api'
import { useGameStore } from '@/store/game-store'
import { useTimerStore } from '@/store/timer-store'
import type { Difficulty, PuzzleSession } from '@/shared/types'
import { DIFFICULTY_CONFIG } from '@/shared/constants'

const DIFFICULTY_KEYS = Object.keys(DIFFICULTY_CONFIG) as Difficulty[]

export function Game() {
  const { difficulty } = useParams<{ difficulty: Difficulty }>()
  const navigate = useNavigate()
  const location = useLocation()
  const [session, setSession] = useState<PuzzleSession | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const diff = difficulty as Difficulty
  const wantsResume = !!(location.state as { resume?: boolean } | null)?.resume
  const isRandom = !!(location.state as { random?: boolean } | null)?.random
  const [gameKey, setGameKey] = useState(0)

  function handlePlayAgain() {
    if (isRandom) {
      const key = DIFFICULTY_KEYS[Math.floor(Math.random() * DIFFICULTY_KEYS.length)]
      navigate(`/juego/${key}`, { state: { random: true } })
    } else {
      setGameKey((k) => k + 1)
    }
  }

  useEffect(() => {
    if (!diff || !DIFFICULTY_CONFIG[diff]) {
      navigate('/', { replace: true })
      return
    }

    // Only restore saved game if explicitly requested via "Continuar partida"
    if (wantsResume) {
      const saved = useGameStore.getState()
      if (
        (saved.status === 'playing' || saved.status === 'paused') &&
        saved.difficulty === diff &&
        saved.puzzleId && saved.sessionToken && saved.givens
      ) {
        setSession({
          givens: saved.givens,
          puzzleId: saved.puzzleId,
          sessionToken: saved.sessionToken,
          solution: saved.solution ?? '',
          difficulty: saved.difficulty!,
          startedAt: Date.now(),
        })
        setLoading(false)
        return
      }
    }

    // Starting a new game — clear any saved state
    useGameStore.getState().reset()
    useTimerStore.getState().reset()

    async function loadPuzzle() {
      setLoading(true)
      setError(null)
      try {
        const data = await api.post<PuzzleSession>('/api/puzzle/generate', { difficulty: diff })
        setSession(data)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Error al cargar el puzzle')
      } finally {
        setLoading(false)
      }
    }
    loadPuzzle()
  }, [diff, navigate, wantsResume, gameKey])

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-4 border-(--color-primary) border-t-transparent rounded-full animate-spin" />
            <p className="text-(--color-text-muted) text-sm">Generando puzzle...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !session) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-(--color-text-error) mb-4">{error ?? 'Error desconocido'}</p>
            <button
              onClick={() => navigate('/')}
              className="px-4 py-2 bg-(--color-primary) text-white rounded-lg"
            >
              Volver al inicio
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="flex-1 flex flex-col">
        <ErrorBoundary>
          <GameScreen
            givens={session.givens}
            puzzleId={session.puzzleId}
            sessionToken={session.sessionToken}
            solution={session.solution}
            difficulty={diff}
            onPlayAgain={handlePlayAgain}
          />
        </ErrorBoundary>
      </div>
    </div>
  )
}
