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
  weeklyGames: number
  weeklyTotal: number
}

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
}

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
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

  function handleContinue() {
    if (savedIsDaily) navigate('/diario')
    else navigate(`/juego/${savedDifficulty}`, { state: { resume: true } })
  }

  const continueLabel = savedIsDaily
    ? 'Continuar reto diario'
    : `Continuar · ${DIFFICULTY_CONFIG[savedDifficulty!]?.label ?? ''}`

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-(--color-surface)">
      <Header />

      <main className="flex-1 flex items-center justify-center px-4">
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="show"
          className="w-full max-w-sm flex flex-col items-center gap-5"
        >
          {/* Stats — top, prominent */}
          {stats && (
            <motion.div variants={fadeUp} className="w-full grid grid-cols-3 gap-2">
              <div className="relative py-4 rounded-2xl bg-(--color-primary)/8 text-center overflow-hidden">
                <p className="text-3xl font-extrabold text-(--color-primary) tabular-nums">{stats.gamesToday}</p>
                <p className="text-[11px] text-(--color-text-muted) mt-1 font-medium">Hoy</p>
              </div>
              <div className="relative py-4 rounded-2xl bg-amber-500/8 text-center overflow-hidden">
                <p className="text-3xl font-extrabold text-amber-500 tabular-nums">{stats.weeklyGames}</p>
                <p className="text-[11px] text-(--color-text-muted) mt-1 font-medium">Esta semana</p>
              </div>
              <div className="relative py-4 rounded-2xl bg-emerald-500/8 text-center overflow-hidden">
                <p className="text-3xl font-extrabold text-emerald-500 tabular-nums">
                  {stats.weeklyRank ? `#${stats.weeklyRank}` : '—'}
                </p>
                <p className="text-[11px] text-(--color-text-muted) mt-1 font-medium">Ranking</p>
              </div>
            </motion.div>
          )}

          {/* Hero */}
          <motion.div variants={fadeUp} className="text-center">
            <h1 className="text-5xl font-extrabold tracking-tight text-(--color-text) leading-none">
              Sudoku
            </h1>
            <p className="text-(--color-text-muted) mt-2 text-sm font-light tracking-wide">
              Concentración pura. Sin distracciones.
            </p>
          </motion.div>

          {/* Continue game */}
          {hasSavedGame && (
            <motion.button
              variants={fadeUp}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleContinue}
              className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl bg-(--color-primary) text-white text-base font-semibold shadow-lg shadow-(--color-primary)/20 hover:shadow-xl hover:shadow-(--color-primary)/30 transition-shadow"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="6 3 20 12 6 21" />
              </svg>
              {continueLabel}
            </motion.button>
          )}

          {/* Random game — primary CTA */}
          {!hasSavedGame && (
            <motion.button
              variants={fadeUp}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                const key = DIFFICULTY_KEYS[Math.floor(Math.random() * DIFFICULTY_KEYS.length)]
                navigate(`/juego/${key}`, { state: { random: true } })
              }}
              className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl bg-(--color-primary) text-white text-base font-semibold shadow-lg shadow-(--color-primary)/20 hover:shadow-xl hover:shadow-(--color-primary)/30 transition-shadow"
            >
              Partida rápida
            </motion.button>
          )}

          {/* Daily challenge */}
          <motion.button
            variants={fadeUp}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/diario')}
            className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl border border-(--color-border) bg-(--color-surface) hover:bg-(--color-surface-alt) transition-colors"
          >
            <div className="w-9 h-9 rounded-xl bg-(--color-primary)/10 flex items-center justify-center shrink-0">
              <svg className="w-[18px] h-[18px] text-(--color-primary)" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-semibold text-(--color-text)">Reto diario</p>
              <p className="text-[11px] text-(--color-text-muted)">Compite con todos los jugadores</p>
            </div>
            <svg className="w-4 h-4 text-(--color-text-muted)" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><path d="M9 18l6-6-6-6" /></svg>
          </motion.button>

          {/* Rankings */}
          <motion.button
            variants={fadeUp}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/ranking')}
            className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl border border-(--color-border) bg-(--color-surface) hover:bg-(--color-surface-alt) transition-colors"
          >
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0">
              <svg className="w-[18px] h-[18px] text-amber-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
                <path d="M6 9H4a2 2 0 0 0-2 2v1a2 2 0 0 0 2 2h2" />
                <path d="M18 9h2a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2h-2" />
                <path d="M6 5h12v8a6 6 0 0 1-12 0V5Z" />
                <path d="M9 21h6" />
                <path d="M12 17v4" />
              </svg>
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-semibold text-(--color-text)">Ranking</p>
              <p className="text-[11px] text-(--color-text-muted)">Clasificación diaria y semanal</p>
            </div>
            <svg className="w-4 h-4 text-(--color-text-muted)" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><path d="M9 18l6-6-6-6" /></svg>
          </motion.button>

          {/* Choose difficulty — dots + label + play */}
          <motion.div variants={fadeUp} className="w-full flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex gap-1.5">
                {DIFFICULTY_KEYS.map((key) => {
                  const cfg = DIFFICULTY_CONFIG[key]
                  const active = selectedDiff === key
                  return (
                    <button
                      key={key}
                      onClick={() => setSelectedDiff(key)}
                      className="p-0.5"
                      title={cfg.label}
                    >
                      <div
                        className="rounded-full transition-all duration-200"
                        style={{
                          backgroundColor: cfg.color,
                          width: active ? 12 : 8,
                          height: active ? 12 : 8,
                          opacity: active ? 1 : 0.35,
                        }}
                      />
                    </button>
                  )
                })}
              </div>
              <span
                className="text-sm font-semibold transition-colors duration-200"
                style={{ color: DIFFICULTY_CONFIG[selectedDiff].color }}
              >
                {DIFFICULTY_CONFIG[selectedDiff].label}
              </span>
            </div>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handlePlay}
              className="px-5 py-2 rounded-xl text-sm font-semibold text-(--color-primary) bg-(--color-surface-alt) hover:bg-(--color-surface-raised) transition-colors"
            >
              Jugar
            </motion.button>
          </motion.div>

        </motion.div>
      </main>
    </div>
  )
}
