import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { DIFFICULTY_CONFIG } from '@/shared/constants'
import type { Difficulty } from '@/shared/types'
import { useGameStore } from '@/store/game-store'
import { Header } from '@/components/layout/Header'
import { api } from '@/lib/api'

const DIFFICULTY_KEYS = Object.keys(DIFFICULTY_CONFIG) as Difficulty[]

interface TodayStats {
  gamesToday: number
  weeklyRank: number | null
  weeklyTotal: number
}

function DiceIcon() {
  return (
    <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="4" />
      <circle cx="8"  cy="8"  r="1.3" fill="currentColor" stroke="none" />
      <circle cx="16" cy="8"  r="1.3" fill="currentColor" stroke="none" />
      <circle cx="8"  cy="16" r="1.3" fill="currentColor" stroke="none" />
      <circle cx="16" cy="16" r="1.3" fill="currentColor" stroke="none" />
      <circle cx="12" cy="12" r="1.3" fill="currentColor" stroke="none" />
    </svg>
  )
}

function ChevronRight() {
  return (
    <svg className="w-4 h-4 shrink-0 text-(--color-text-muted)" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 18l6-6-6-6" />
    </svg>
  )
}

export function Home() {
  const navigate = useNavigate()
  const savedStatus = useGameStore((s) => s.status)
  const savedDifficulty = useGameStore((s) => s.difficulty)
  const savedIsDaily = useGameStore((s) => s.isDaily)
  const hasSavedGame = (savedStatus === 'playing' || savedStatus === 'paused') && savedDifficulty

  const [selectedDiff, setSelectedDiff] = useState<Difficulty>('medio')
  const [stats, setStats] = useState<TodayStats | null>(null)

  useEffect(() => {
    api.get<TodayStats>('/api/user/today-stats')
      .then(setStats)
      .catch(() => {})
  }, [])

  function handlePlay() {
    navigate(`/juego/${selectedDiff}`)
  }

  function handleRandom() {
    const key = DIFFICULTY_KEYS[Math.floor(Math.random() * DIFFICULTY_KEYS.length)]
    navigate(`/juego/${key}`)
  }

  const continueLabel = savedIsDaily
    ? 'Continuar reto diario'
    : `Continuar partida · ${DIFFICULTY_CONFIG[savedDifficulty!]?.label ?? ''}`

  // ── Sub-componentes ─────────────────────────────────────────

  const heroBlock = (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="flex flex-col gap-3"
    >
      <div>
        <h1 className="text-5xl font-black tracking-tight text-(--color-text) leading-none">Sudoku</h1>
        <p className="text-(--color-text-muted) mt-2">El clásico juego de lógica. Sin distracciones.</p>
      </div>

      {hasSavedGame && (
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => {
            if (savedIsDaily) navigate('/diario')
            else navigate(`/juego/${savedDifficulty}`, { state: { resume: true } })
          }}
          className="flex items-center justify-center gap-2.5 py-4 rounded-2xl bg-(--color-primary) text-white text-base font-bold shadow-lg hover:opacity-90 transition-opacity"
        >
          <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
            <polygon points="5 3 19 12 5 21 5 3" fill="currentColor" stroke="none" />
          </svg>
          {continueLabel}
        </motion.button>
      )}

      {/* Difficulty selector + play */}
      <div className="flex gap-2">
        <select
          value={selectedDiff}
          onChange={(e) => setSelectedDiff(e.target.value as Difficulty)}
          className="flex-1 py-3.5 px-4 rounded-xl border border-(--color-border) bg-(--color-surface) text-(--color-text) text-sm font-semibold appearance-none cursor-pointer focus:outline-none focus:border-(--color-primary)"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%239ca3af' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'right 12px center',
          }}
        >
          {DIFFICULTY_KEYS.map((key) => (
            <option key={key} value={key}>{DIFFICULTY_CONFIG[key].label}</option>
          ))}
        </select>
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handlePlay}
          className={[
            'px-6 py-3.5 rounded-xl text-base font-bold transition-opacity hover:opacity-90',
            hasSavedGame
              ? 'border border-(--color-border) bg-(--color-surface) text-(--color-text)'
              : 'bg-(--color-primary) text-white shadow-lg',
          ].join(' ')}
        >
          Jugar
        </motion.button>
      </div>

      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={handleRandom}
        className="flex items-center justify-center gap-2.5 py-3 rounded-xl border border-(--color-border) bg-(--color-surface) text-(--color-text) text-sm font-semibold hover:bg-(--color-surface-alt) transition-colors"
      >
        <DiceIcon />
        Partida rápida
      </motion.button>
    </motion.div>
  )

  const statsBlock = stats && (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.15, duration: 0.3 }}
      className="grid grid-cols-2 gap-3"
    >
      <div className="flex items-center gap-3 p-4 rounded-xl border border-(--color-border) bg-(--color-surface)">
        <span className="text-2xl">🎮</span>
        <div>
          <p className="text-lg font-bold text-(--color-text)">{stats.gamesToday}</p>
          <p className="text-xs text-(--color-text-muted)">Partidas hoy</p>
        </div>
      </div>
      <div className="flex items-center gap-3 p-4 rounded-xl border border-(--color-border) bg-(--color-surface)">
        <span className="text-2xl">🏆</span>
        <div>
          <p className="text-lg font-bold text-(--color-text)">
            {stats.weeklyRank ? `#${stats.weeklyRank}` : '—'}
          </p>
          <p className="text-xs text-(--color-text-muted)">Ranking semanal</p>
        </div>
      </div>
    </motion.div>
  )

  const secondaryBlock = (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.25, duration: 0.3 }}
      className="flex flex-col gap-2"
    >
      <button
        onClick={() => navigate('/diario')}
        className="flex items-center gap-3 px-4 py-3.5 rounded-xl border border-(--color-border) bg-(--color-surface) hover:bg-(--color-surface-alt) transition-colors text-left group"
      >
        <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-950 flex items-center justify-center shrink-0">
          <svg className="w-5 h-5 text-(--color-primary)" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8"  y1="2" x2="8"  y2="6" />
            <line x1="3"  y1="10" x2="21" y2="10" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-(--color-text) text-sm">Sudoku del día</p>
          <p className="text-xs text-(--color-text-muted)">Compite con todos los jugadores</p>
        </div>
        <ChevronRight />
      </button>

      <button
        onClick={() => navigate('/ranking')}
        className="flex items-center gap-3 px-4 py-3.5 rounded-xl border border-(--color-border) bg-(--color-surface) hover:bg-(--color-surface-alt) transition-colors text-left group"
      >
        <div className="w-9 h-9 rounded-lg bg-amber-50 dark:bg-amber-950 flex items-center justify-center shrink-0">
          <svg className="w-5 h-5 text-amber-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <polyline points="18 20 18 10" />
            <polyline points="12 20 12 4"  />
            <polyline points="6  20 6  14"  />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-(--color-text) text-sm">Rankings</p>
          <p className="text-xs text-(--color-text-muted)">Clasificación semanal</p>
        </div>
        <ChevronRight />
      </button>
    </motion.div>
  )

  return (
    <div className="flex flex-col min-h-screen bg-(--color-surface)">
      <Header />

      <main className="flex-1 w-full max-w-5xl mx-auto px-4 py-10">

        {/* ── Mobile: columna única ── */}
        <div className="flex flex-col gap-6 lg:hidden max-w-md mx-auto">
          {heroBlock}
          {statsBlock}
          {secondaryBlock}
        </div>

        {/* ── Desktop: dos columnas ── */}
        <div className="hidden lg:grid grid-cols-[340px_1fr] gap-16 items-start">
          {/* Columna izquierda: hero + CTA */}
          <div className="flex flex-col gap-6 sticky top-24">
            {heroBlock}
          </div>

          {/* Columna derecha: stats + acciones secundarias */}
          <div className="flex flex-col gap-6">
            {statsBlock}
            {secondaryBlock}
          </div>
        </div>

      </main>
    </div>
  )
}
