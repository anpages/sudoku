import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { DIFFICULTY_CONFIG } from '@/shared/constants'
import type { Difficulty } from '@/shared/types'
import { Header } from '@/components/layout/Header'

const DIFFICULTY_KEYS = Object.keys(DIFFICULTY_CONFIG) as Difficulty[]

const DESCRIPTIONS: Record<Difficulty, string> = {
  facil:   'Perfecto para empezar',
  medio:   'Un reto equilibrado',
  dificil: 'Requiere concentración',
  experto: 'Para mentes ágiles',
  maestro: 'Un verdadero desafío',
  extremo: 'Solo para expertos',
}

const LEVEL: Record<Difficulty, number> = {
  facil: 1, medio: 2, dificil: 3, experto: 4, maestro: 5, extremo: 6,
}

function DifficultyBars({ level, color }: { level: number; color: string }) {
  return (
    <div className="flex items-end gap-[3px]">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div
          key={i}
          className="w-[5px] rounded-sm"
          style={{
            height: `${8 + i * 2}px`,
            backgroundColor: color,
            opacity: i <= level ? 1 : 0.18,
          }}
        />
      ))}
    </div>
  )
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

const listVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
}
const itemVariant = {
  hidden: { opacity: 0, x: 10 },
  show:   { opacity: 1, x: 0,  transition: { duration: 0.2 } },
}

export function Home() {
  const navigate = useNavigate()

  function handleRandom() {
    const key = DIFFICULTY_KEYS[Math.floor(Math.random() * DIFFICULTY_KEYS.length)]
    navigate(`/juego/${key}`)
  }

  // ── Sub-componentes reutilizables ─────────────────────────────────────────

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

      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={handleRandom}
        className="flex items-center justify-center gap-2.5 py-4 rounded-2xl bg-(--color-primary) text-white text-base font-bold shadow-lg hover:opacity-90 transition-opacity"
      >
        <DiceIcon />
        Partida rápida
      </motion.button>
      <p className="text-xs text-(--color-text-muted) text-center -mt-1">Dificultad aleatoria</p>
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
          <p className="text-xs text-(--color-text-muted)">Clasificación diaria y semanal</p>
        </div>
        <ChevronRight />
      </button>
    </motion.div>
  )

  const difficultyBlock = (
    <div className="flex flex-col gap-3">
      <p className="text-xs font-semibold uppercase tracking-widest text-(--color-text-muted) px-1">
        Elegir dificultad
      </p>
      <motion.div variants={listVariants} initial="hidden" animate="show" className="flex flex-col gap-2">
        {DIFFICULTY_KEYS.map((key) => {
          const cfg = DIFFICULTY_CONFIG[key]
          return (
            <motion.button
              key={key}
              variants={itemVariant}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate(`/juego/${key}`)}
              className="group flex items-center gap-4 px-4 py-3.5 rounded-xl border border-(--color-border) bg-(--color-surface) hover:bg-(--color-surface-alt) hover:border-[var(--diff-color)] transition-all text-left"
              style={{ '--diff-color': cfg.color } as React.CSSProperties}
            >
              <div className="w-1 h-10 rounded-full shrink-0" style={{ backgroundColor: cfg.color }} />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-(--color-text) text-sm leading-tight">{cfg.label}</p>
                <p className="text-xs text-(--color-text-muted) mt-0.5">{DESCRIPTIONS[key]}</p>
              </div>
              <DifficultyBars level={LEVEL[key]} color={cfg.color} />
              <ChevronRight />
            </motion.button>
          )
        })}
      </motion.div>
    </div>
  )

  return (
    <div className="flex flex-col min-h-screen bg-(--color-surface)">
      <Header />

      <main className="flex-1 w-full max-w-5xl mx-auto px-4 py-10">

        {/* ── Mobile: columna única ── */}
        <div className="flex flex-col gap-8 lg:hidden max-w-md mx-auto">
          {heroBlock}
          {difficultyBlock}
          {secondaryBlock}
        </div>

        {/* ── Desktop: dos columnas ── */}
        <div className="hidden lg:grid grid-cols-[340px_1fr] gap-16 items-start">
          {/* Columna izquierda: hero + CTA + acciones secundarias */}
          <div className="flex flex-col gap-6 sticky top-24">
            {heroBlock}
            {secondaryBlock}
          </div>

          {/* Columna derecha: selector de dificultad */}
          <div>
            {difficultyBlock}
          </div>
        </div>

      </main>
    </div>
  )
}
