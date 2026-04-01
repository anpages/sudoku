import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { api } from '@/lib/api'
import { formatTime } from '@/shared/scoring'
import { DIFFICULTY_CONFIG } from '@/shared/constants'
import type { DailyCompletion, DailyPuzzle, RankingEntry } from '@/shared/types'

interface Props {
  daily: DailyPuzzle
  myCompletion: DailyCompletion
  onPlay: () => void
}

export function DailyCompletionView({ daily, myCompletion, onPlay }: Props) {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [ranking, setRanking] = useState<RankingEntry[]>([])
  const [loading, setLoading] = useState(true)
  const config = DIFFICULTY_CONFIG[daily.difficulty]

  useEffect(() => {
    api.get<RankingEntry[]>(`/api/rankings/daily?t=${Date.now()}`)
      .then(setRanking)
      .finally(() => setLoading(false))
  }, [])

  const date = new Date(daily.date).toLocaleDateString('es-ES', {
    weekday: 'long', day: 'numeric', month: 'long',
  })

  const rankLabel =
    myCompletion.rank === 1 ? '🥇'
    : myCompletion.rank === 2 ? '🥈'
    : myCompletion.rank === 3 ? '🥉'
    : myCompletion.rank !== null ? `#${myCompletion.rank}`
    : '—'

  return (
    <div className="flex flex-col items-center px-4 py-6 w-full max-w-lg mx-auto gap-5">

      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-1">
          <svg className="w-4 h-4 text-(--color-primary)" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          <span className="text-xs font-semibold text-(--color-text-muted) uppercase tracking-widest capitalize">
            {date}
          </span>
        </div>
        <h2 className="text-xl font-bold text-(--color-text)">Reto completado</h2>
        <span className="text-sm font-semibold" style={{ color: config.color }}>{config.label}</span>
      </div>

      {/* User's best result */}
      <div className="w-full rounded-2xl border border-(--color-primary) bg-(--color-cell-highlight) p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl font-bold text-(--color-primary)">{rankLabel}</span>
            <div>
              <p className="text-xs text-(--color-text-muted) font-medium">Tu mejor tiempo</p>
              <p className="text-xl font-bold font-mono text-(--color-text)">{formatTime(myCompletion.elapsedSeconds)}</p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1 text-xs text-(--color-text-muted)">
            {myCompletion.errorsMade > 0 && (
              <span className="flex items-center gap-1 text-red-500 font-semibold">
                <span>✗</span> {myCompletion.errorsMade} error{myCompletion.errorsMade > 1 ? 'es' : ''}
              </span>
            )}
            {myCompletion.hintsUsed > 0 && (
              <span className="flex items-center gap-1 text-amber-500 font-semibold">
                <span>💡</span> {myCompletion.hintsUsed} pista{myCompletion.hintsUsed > 1 ? 's' : ''}
              </span>
            )}
            {myCompletion.errorsMade === 0 && myCompletion.hintsUsed === 0 && (
              <span className="text-emerald-500 font-semibold">Perfecto</span>
            )}
          </div>
        </div>
      </div>

      {/* Ranking table */}
      <div className="w-full">
        <h3 className="text-sm font-semibold text-(--color-text-muted) uppercase tracking-wide mb-3">Ranking de hoy</h3>
        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }, (_, i) => (
              <div key={i} className="h-12 rounded-xl bg-(--color-surface-alt) animate-pulse" />
            ))}
          </div>
        ) : ranking.length === 0 ? (
          <p className="text-center text-(--color-text-muted) py-4 text-sm">Sin resultados aún</p>
        ) : (
          <div className="space-y-1.5">
            {ranking.map((entry) => {
              const isMe = entry.userId === user?.id
              return (
                <div
                  key={entry.userId}
                  className={[
                    'flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-colors',
                    isMe
                      ? 'border-(--color-primary) bg-(--color-cell-highlight)'
                      : 'border-(--color-border) bg-(--color-surface)',
                  ].join(' ')}
                >
                  <span className={[
                    'w-7 text-center font-bold text-sm shrink-0',
                    entry.rank === 1 ? 'text-yellow-500'
                    : entry.rank === 2 ? 'text-slate-400'
                    : entry.rank === 3 ? 'text-amber-600'
                    : 'text-(--color-text-muted)',
                  ].join(' ')}>
                    {entry.rank <= 3 ? ['🥇', '🥈', '🥉'][entry.rank - 1] : `#${entry.rank}`}
                  </span>

                  {entry.avatarUrl ? (
                    <img src={entry.avatarUrl} alt={entry.name} className="w-7 h-7 rounded-full object-cover shrink-0" />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-(--color-primary) flex items-center justify-center text-white text-xs font-bold shrink-0">
                      {entry.name[0].toUpperCase()}
                    </div>
                  )}

                  <span className="flex-1 text-sm font-medium text-(--color-text) truncate">{entry.name}</span>

                  <div className="flex items-center gap-2 shrink-0">
                    {entry.errorsMade > 0 && (
                      <span className="text-xs text-red-500 font-semibold">✗{entry.errorsMade}</span>
                    )}
                    {entry.hintsUsed > 0 && (
                      <span className="text-xs text-amber-500 font-semibold">💡{entry.hintsUsed}</span>
                    )}
                    <span className="font-mono text-sm font-semibold text-(--color-primary)">
                      {formatTime(entry.elapsedSeconds)}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3 w-full pt-1">
        <button
          onClick={() => navigate('/')}
          className="flex-1 py-3 rounded-xl border-2 border-(--color-border) text-(--color-text) font-semibold hover:bg-(--color-surface-alt) transition-colors text-sm"
        >
          Inicio
        </button>
        <button
          onClick={onPlay}
          className="flex-1 py-3 rounded-xl bg-(--color-primary) text-white font-semibold hover:bg-(--color-primary-dark) transition-colors text-sm"
        >
          Repetir
        </button>
      </div>
    </div>
  )
}
