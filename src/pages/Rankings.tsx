import { useState, useEffect } from 'react'
import { Header } from '@/components/layout/Header'
import { api } from '@/lib/api'
import { formatTime } from '@/shared/scoring'
import type { RankingEntry, WeeklyRankingEntry } from '@/shared/types'
import { useAuth } from '@/hooks/useAuth'

export function Rankings() {
  const [tab, setTab] = useState<'daily' | 'weekly'>('daily')
  const { user } = useAuth()

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="max-w-2xl mx-auto w-full px-4 py-8">
        <h1 className="text-2xl font-bold text-(--color-text) mb-6">Rankings</h1>

        <div className="flex gap-1 bg-(--color-surface-alt) p-1 rounded-xl mb-6">
          {(['daily', 'weekly'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={[
                'flex-1 py-2 rounded-lg text-sm font-semibold transition-all',
                tab === t
                  ? 'bg-(--color-surface) shadow text-(--color-primary)'
                  : 'text-(--color-text-muted) hover:text-(--color-text)',
              ].join(' ')}
            >
              {t === 'daily' ? '📅 Hoy' : '📊 Esta semana'}
            </button>
          ))}
        </div>

        {tab === 'daily' ? (
          <DailyRankingList currentUserId={user?.id} />
        ) : (
          <WeeklyRankingList currentUserId={user?.id} />
        )}
      </main>
    </div>
  )
}

function DailyRankingList({ currentUserId }: { currentUserId?: string }) {
  const [entries, setEntries] = useState<RankingEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get<RankingEntry[]>('/api/rankings/daily')
      .then(setEntries)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <RankingSkeletons />

  return (
    <RankingTable
      entries={entries.map((e) => ({
        rank: e.rank,
        userId: e.userId,
        name: e.name,
        avatarUrl: e.avatarUrl,
        metric: formatTime(e.adjustedTime),
        isCurrentUser: e.userId === currentUserId,
      }))}
    />
  )
}

function WeeklyRankingList({ currentUserId }: { currentUserId?: string }) {
  const [entries, setEntries] = useState<WeeklyRankingEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get<WeeklyRankingEntry[]>('/api/rankings/weekly')
      .then(setEntries)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <RankingSkeletons />

  return (
    <RankingTable
      entries={entries.map((e) => ({
        rank: e.rank,
        userId: e.userId,
        name: e.name,
        avatarUrl: e.avatarUrl,
        metric: `${formatTime(e.totalAdjustedTime)} · ${e.gamesPlayed} partidas`,
        isCurrentUser: e.userId === currentUserId,
      }))}
    />
  )
}

interface TableEntry {
  rank: number
  userId: string
  name: string
  avatarUrl: string | null
  metric: string
  isCurrentUser: boolean
}

function RankingTable({ entries }: { entries: TableEntry[] }) {
  if (entries.length === 0) {
    return (
      <div className="text-center py-16 text-(--color-text-muted)">
        <p className="text-3xl mb-3">🏆</p>
        <p>Sin resultados todavía. ¡Sé el primero!</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {entries.map((e) => (
        <div
          key={e.userId}
          className={[
            'flex items-center gap-3 p-3 rounded-xl border transition-colors',
            e.isCurrentUser
              ? 'border-(--color-primary) bg-(--color-cell-highlight)'
              : 'border-(--color-border) bg-(--color-surface)',
          ].join(' ')}
        >
          <span className={[
            'w-8 text-center font-bold text-sm',
            e.rank === 1 ? 'text-yellow-500' : e.rank === 2 ? 'text-slate-400' : e.rank === 3 ? 'text-amber-600' : 'text-(--color-text-muted)',
          ].join(' ')}>
            {e.rank <= 3 ? ['🥇', '🥈', '🥉'][e.rank - 1] : `#${e.rank}`}
          </span>

          {e.avatarUrl ? (
            <img src={e.avatarUrl} alt={e.name} className="w-8 h-8 rounded-full object-cover" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-(--color-primary) flex items-center justify-center text-white text-xs font-bold">
              {e.name[0].toUpperCase()}
            </div>
          )}

          <span className="flex-1 font-medium text-sm text-(--color-text) truncate">{e.name}</span>
          <span className="font-mono text-sm font-semibold text-(--color-primary)">{e.metric}</span>
        </div>
      ))}
    </div>
  )
}

function RankingSkeletons() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 8 }, (_, i) => (
        <div key={i} className="h-14 rounded-xl bg-(--color-surface-alt) animate-pulse" />
      ))}
    </div>
  )
}
