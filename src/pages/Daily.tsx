import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { GameScreen } from '@/components/game/GameScreen'
import { Header } from '@/components/layout/Header'
import { api } from '@/lib/api'
import { useGameStore } from '@/store/game-store'
import { useTimerStore } from '@/store/timer-store'
import { DailyCompletionView } from '@/components/daily/DailyCompletionView'
import type { DailyPuzzle } from '@/shared/types'

export function Daily() {
  const navigate = useNavigate()
  const [daily, setDaily] = useState<DailyPuzzle | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [forcePlay, setForcePlay] = useState(false)

  useEffect(() => {
    api.get<DailyPuzzle>('/api/puzzle/daily')
      .then(setDaily)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-(--color-primary) border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  if (error || !daily) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-2xl mb-2">📅</p>
            <p className="text-(--color-text-muted)">{error ?? 'No hay sudoku diario disponible'}</p>
            <button onClick={() => navigate('/')} className="mt-4 px-4 py-2 bg-(--color-primary) text-white rounded-lg text-sm">
              Volver
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Already completed today — show ranking view (unless user chose to play again)
  if (daily.myCompletion && !forcePlay) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <div className="flex-1 overflow-y-auto">
          <DailyCompletionView
            daily={daily}
            myCompletion={daily.myCompletion}
            onPlay={() => setForcePlay(true)}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="flex-1 flex flex-col">
        <DailyGameLoader daily={daily} />
      </div>
    </div>
  )
}

function DailyGameLoader({ daily }: { daily: DailyPuzzle }) {
  const [session, setSession] = useState<{ sessionToken: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const [sessionKey, setSessionKey] = useState(0)
  const navigate = useNavigate()

  function handlePlayAgain() {
    useGameStore.getState().reset()
    useTimerStore.getState().reset()
    setSessionKey((k) => k + 1)
  }

  useEffect(() => {
    setLoading(true)
    setSession(null)
    api.post<{ sessionToken: string }>('/api/puzzle/daily-session', {
      dailyPuzzleId: daily.id,
    })
      .then(setSession)
      .catch(() => navigate('/'))
      .finally(() => setLoading(false))
  }, [daily.id, navigate, sessionKey])

  if (loading) {
    return (
      <div className="flex justify-center">
        <div className="w-8 h-8 border-4 border-(--color-primary) border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!session) return null

  return (
    <DailyGameScreen
      givens={daily.givens}
      puzzleId={daily.puzzleId}
      sessionToken={session.sessionToken}
      difficulty={daily.difficulty}
      date={daily.date}
      onPlayAgain={handlePlayAgain}
    />
  )
}

/** Wraps GameScreen and marks the game as daily in the store */
function DailyGameScreen(props: {
  givens: string
  puzzleId: string
  sessionToken: string
  difficulty: import('@/shared/types').Difficulty
  date: string
  onPlayAgain: () => void
}) {
  const { date, onPlayAgain, ...gameProps } = props

  useEffect(() => {
    // Mark as daily after GameScreen's initGame runs
    useGameStore.setState({ isDaily: true })
  }, [])

  return <GameScreen {...gameProps} isDaily dailyDate={date} onPlayAgain={onPlayAgain} />
}
