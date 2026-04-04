import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Header } from '@/components/layout/Header'
import { api } from '@/lib/api'
import { formatTime } from '@/shared/scoring'
import { DIFFICULTY_CONFIG } from '@/shared/constants'
import type { RecentGame } from '@/shared/types'

export function RecentGames() {
  const navigate = useNavigate()
  const [games, setGames] = useState<RecentGame[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get<RecentGame[]>('/api/user/recent-games')
      .then(setGames)
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="max-w-lg mx-auto w-full px-4 py-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-sm text-(--color-text-muted) hover:text-(--color-text) mb-6 transition-colors"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><path d="M15 18l-6-6 6-6" /></svg>
          Volver
        </button>

        <h1 className="text-2xl font-bold text-(--color-text) mb-6">Últimas partidas</h1>

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }, (_, i) => (
              <div key={i} className="h-20 rounded-2xl bg-(--color-surface-alt) animate-pulse" />
            ))}
          </div>
        ) : games.length === 0 ? (
          <div className="text-center py-16 text-(--color-text-muted)">
            <p className="text-3xl mb-3">🎮</p>
            <p>Aún no has completado ninguna partida.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {games.map((g, i) => {
              const cfg = DIFFICULTY_CONFIG[g.difficulty as keyof typeof DIFFICULTY_CONFIG]
              const date = new Date(g.completedAt)
              const dateLabel = date.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' })
              const timeLabel = date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
              const isPenalized = g.hintsUsed > 0 || g.autoPencilUsed > 0

              return (
                <div
                  key={i}
                  className="flex items-center gap-4 px-4 py-3.5 rounded-2xl border border-(--color-border) bg-(--color-surface)"
                >
                  {/* Difficulty dot */}
                  <div
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: cfg?.color ?? '#888' }}
                  />

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-semibold text-(--color-text)" style={{ color: cfg?.color }}>
                        {cfg?.label ?? g.difficulty}
                      </span>
                      {g.isDaily && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-(--color-primary)/10 text-(--color-primary)">
                          Diario
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-(--color-text-muted) mt-0.5 capitalize">{dateLabel} · {timeLabel}</p>
                  </div>

                  {/* Penalties */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    {g.errorsMade > 0 && (
                      <span className="text-xs text-red-500 font-semibold">✗{g.errorsMade}</span>
                    )}
                    {g.hintsUsed > 0 && (
                      <span className="text-xs text-blue-500 font-semibold">💡{g.hintsUsed}</span>
                    )}
                    {g.autoPencilUsed > 0 && (
                      <span className="text-xs text-violet-500 font-semibold">✏️</span>
                    )}
                  </div>

                  {/* Time */}
                  <div className="text-right shrink-0">
                    <p className="font-mono text-sm font-bold text-(--color-text)">{formatTime(g.elapsedSeconds)}</p>
                    {isPenalized && (
                      <p className="font-mono text-[10px] text-(--color-text-muted)">({formatTime(g.adjustedTime)})</p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
