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
    <div className="flex flex-col min-h-screen bg-(--color-surface)">
      <Header />

      <main className="flex-1 flex items-center justify-center px-4 py-8 lg:py-0">
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="show"
          className="w-full max-w-sm flex flex-col items-center gap-8"
        >
          {/* Hero */}
          <motion.div variants={fadeUp} className="text-center">
            <h1 className="text-6xl font-extrabold tracking-tight text-(--color-text) leading-none">
              Sudoku
            </h1>
            <p className="text-(--color-text-muted) mt-3 text-base font-light tracking-wide">
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
                navigate(`/juego/${key}`)
              }}
              className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl bg-(--color-primary) text-white text-base font-semibold shadow-lg shadow-(--color-primary)/20 hover:shadow-xl hover:shadow-(--color-primary)/30 transition-shadow"
            >
              Partida rápida
            </motion.button>
          )}

          {/* Choose difficulty */}
          <motion.div variants={fadeUp} className="w-full flex flex-col gap-3">
            <div className="grid grid-cols-3 gap-2">
              {DIFFICULTY_KEYS.map((key) => {
                const cfg = DIFFICULTY_CONFIG[key]
                const active = selectedDiff === key
                return (
                  <button
                    key={key}
                    onClick={() => setSelectedDiff(key)}
                    className={[
                      'relative py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                      active
                        ? 'text-white shadow-md'
                        : 'text-(--color-text-muted) bg-(--color-surface-alt) hover:bg-(--color-surface-raised)',
                    ].join(' ')}
                    style={active ? { backgroundColor: cfg.color, boxShadow: `0 4px 14px ${cfg.color}33` } : undefined}
                  >
                    {cfg.label}
                  </button>
                )
              })}
            </div>

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={handlePlay}
              className="w-full py-3.5 rounded-2xl text-sm font-semibold border border-(--color-border) text-(--color-text) hover:bg-(--color-surface-alt) transition-colors"
            >
              Elegir dificultad
            </motion.button>
          </motion.div>

          {/* Quick actions */}
          <motion.div variants={fadeUp} className="w-full grid grid-cols-2 gap-3">
            <button
              onClick={() => navigate('/diario')}
              className="flex flex-col items-center gap-2 py-5 rounded-2xl border border-(--color-border) bg-(--color-surface) hover:bg-(--color-surface-alt) transition-colors group"
            >
              <div className="w-10 h-10 rounded-xl bg-(--color-surface-alt) group-hover:bg-(--color-surface-raised) flex items-center justify-center transition-colors">
                <svg className="w-5 h-5 text-(--color-primary)" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
                  <rect x="3" y="4" width="18" height="18" rx="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                  <text x="12" y="17" textAnchor="middle" fontSize="7" fill="currentColor" stroke="none" fontWeight="700">
                    {new Date().getDate()}
                  </text>
                </svg>
              </div>
              <span className="text-sm font-medium text-(--color-text)">Reto diario</span>
            </button>

            <button
              onClick={() => navigate('/ranking')}
              className="flex flex-col items-center gap-2 py-5 rounded-2xl border border-(--color-border) bg-(--color-surface) hover:bg-(--color-surface-alt) transition-colors group"
            >
              <div className="w-10 h-10 rounded-xl bg-(--color-surface-alt) group-hover:bg-(--color-surface-raised) flex items-center justify-center transition-colors">
                <svg className="w-5 h-5 text-amber-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
                  <polyline points="18 20 18 10" />
                  <polyline points="12 20 12 4" />
                  <polyline points="6 20 6 14" />
                </svg>
              </div>
              <span className="text-sm font-medium text-(--color-text)">Rankings</span>
            </button>
          </motion.div>

          {/* Stats */}
          {stats && (
            <motion.div variants={fadeUp} className="w-full flex gap-3">
              <div className="flex-1 text-center py-4 rounded-2xl bg-(--color-surface-alt)">
                <p className="text-2xl font-bold text-(--color-text) tabular-nums">{stats.gamesToday}</p>
                <p className="text-xs text-(--color-text-muted) mt-0.5 font-medium">Partidas hoy</p>
              </div>
              <div className="flex-1 text-center py-4 rounded-2xl bg-(--color-surface-alt)">
                <p className="text-2xl font-bold text-(--color-text) tabular-nums">
                  {stats.weeklyRank ? `#${stats.weeklyRank}` : '—'}
                </p>
                <p className="text-xs text-(--color-text-muted) mt-0.5 font-medium">Ranking semanal</p>
              </div>
            </motion.div>
          )}

        </motion.div>
      </main>
    </div>
  )
}
