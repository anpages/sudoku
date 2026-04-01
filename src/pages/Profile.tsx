import { useEffect, useState } from 'react'
import { Header } from '@/components/layout/Header'
import { api } from '@/lib/api'
import { formatTime } from '@/shared/scoring'
import { DIFFICULTY_CONFIG } from '@/shared/constants'
import type { UserProfile, Difficulty } from '@/shared/types'
import { useAuth } from '@/hooks/useAuth'

export function Profile() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get<UserProfile>('/api/user/profile')
      .then(setProfile)
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="max-w-2xl mx-auto w-full px-4 py-8">
        {/* Avatar + name */}
        <div className="flex items-center gap-4 mb-8">
          {user?.image ? (
            <img src={user.image} alt={user.name ?? ''} className="w-16 h-16 rounded-full object-cover" />
          ) : (
            <div className="w-16 h-16 rounded-full bg-(--color-primary) flex items-center justify-center text-white text-2xl font-bold">
              {(user?.name ?? 'U')[0].toUpperCase()}
            </div>
          )}
          <div>
            <h1 className="text-xl font-bold text-(--color-text)">{user?.name}</h1>
            <p className="text-sm text-(--color-text-muted)">{user?.email}</p>
          </div>
        </div>

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }, (_, i) => (
              <div key={i} className="h-16 rounded-xl bg-(--color-surface-alt) animate-pulse" />
            ))}
          </div>
        ) : profile ? (
          <>
            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 mb-8">
              <StatCard label="Completadas" value={profile.gamesPlayed.toString()} icon="🎮" />
              <StatCard label="Abandonadas" value={profile.gamesAbandoned.toString()} icon="💀" />
              <StatCard label="Racha diaria" value={`${profile.dailyStreak} días`} icon="🔥" />
              <StatCard label="Ratio" value={profile.gamesPlayed > 0 ? `${Math.round((profile.gamesPlayed / (profile.gamesPlayed + profile.gamesAbandoned)) * 100)}%` : '—'} icon="📊" />
            </div>

            {/* Best times */}
            <h2 className="text-lg font-bold text-(--color-text) mb-3">Mejores tiempos</h2>
            <div className="space-y-2">
              {(Object.entries(DIFFICULTY_CONFIG) as [Difficulty, typeof DIFFICULTY_CONFIG[Difficulty]][]).map(
                ([key, config]) => {
                  const best = profile.bestTimesByDifficulty[key]
                  return (
                    <div
                      key={key}
                      className="flex items-center justify-between p-3 rounded-xl border border-(--color-border) bg-(--color-surface)"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: config.color }} />
                        <span className="text-sm font-medium text-(--color-text)">{config.label}</span>
                      </div>
                      <span className="font-mono text-sm font-semibold text-(--color-primary)">
                        {best !== undefined ? formatTime(best) : '—'}
                      </span>
                    </div>
                  )
                },
              )}
            </div>
          </>
        ) : null}
      </main>
    </div>
  )
}

function StatCard({ label, value, icon }: { label: string; value: string; icon: string }) {
  return (
    <div className="flex items-center gap-3 p-4 rounded-xl border border-(--color-border) bg-(--color-surface)">
      <span className="text-2xl">{icon}</span>
      <div>
        <p className="text-lg font-bold text-(--color-text)">{value}</p>
        <p className="text-xs text-(--color-text-muted)">{label}</p>
      </div>
    </div>
  )
}
