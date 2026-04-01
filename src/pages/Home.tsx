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
          className="w-[5px] rounded-sm transition-all"
          style={{
            height: `${8 + i * 2}px`,
            backgroundColor: i <= level ? color : undefined,
            opacity: i <= level ? 1 : 0.18,
            background: i <= level ? color : 'currentColor',
          }}
        />
      ))}
    </div>
  )
}

function DiceIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="4" />
      <circle cx="8"  cy="8"  r="1.2" fill="currentColor" stroke="none" />
      <circle cx="16" cy="8"  r="1.2" fill="currentColor" stroke="none" />
      <circle cx="8"  cy="16" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="16" cy="16" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="12" cy="12" r="1.2" fill="currentColor" stroke="none" />
    </svg>
  )
}

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
}
const item = {
  hidden: { opacity: 0, y: 10 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.25 } },
}

export function Home() {
  const navigate = useNavigate()

  function handleRandom() {
    const key = DIFFICULTY_KEYS[Math.floor(Math.random() * DIFFICULTY_KEYS.length)]
    navigate(`/juego/${key}`)
  }

  return (
    <div className="flex flex-col min-h-screen bg-(--color-surface)">
      <Header />

      <main className="flex-1 flex flex-col items-center px-4 py-10 w-full">
        <div className="w-full max-w-md flex flex-col gap-10">

          {/* ── Hero ── */}
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="text-center flex flex-col items-center gap-4"
          >
            <div className="flex flex-col gap-1">
              <h1 className="text-5xl font-black tracking-tight text-(--color-text)">
                Sudoku
              </h1>
              <p className="text-(--color-text-muted) text-base">
                El clásico juego de lógica. Sin distracciones.
              </p>
            </div>

            {/* CTA aleatorio */}
            <div className="flex flex-col items-center gap-1.5 w-full mt-2">
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleRandom}
                className="w-full flex items-center justify-center gap-2.5 py-4 rounded-2xl bg-(--color-primary) text-white text-lg font-bold shadow-lg hover:opacity-90 transition-opacity"
              >
                <DiceIcon />
                Partida rápida
              </motion.button>
              <span className="text-xs text-(--color-text-muted)">Dificultad aleatoria</span>
            </div>
          </motion.section>

          {/* ── Selector de dificultad ── */}
          <section className="flex flex-col gap-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-(--color-text-muted) px-1">
              Elegir dificultad
            </p>

            <motion.div
              variants={container}
              initial="hidden"
              animate="show"
              className="flex flex-col gap-2"
            >
              {DIFFICULTY_KEYS.map((key) => {
                const cfg = DIFFICULTY_CONFIG[key]
                return (
                  <motion.button
                    key={key}
                    variants={item}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate(`/juego/${key}`)}
                    className="group flex items-center gap-4 px-4 py-3.5 rounded-xl border border-(--color-border) bg-(--color-surface) hover:bg-(--color-surface-alt) hover:border-[var(--diff-color)] transition-all text-left"
                    style={{ '--diff-color': cfg.color } as React.CSSProperties}
                  >
                    {/* Indicador de color */}
                    <div
                      className="w-1 h-10 rounded-full shrink-0"
                      style={{ backgroundColor: cfg.color }}
                    />

                    {/* Nombre + descripción */}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-(--color-text) leading-tight">{cfg.label}</p>
                      <p className="text-xs text-(--color-text-muted) mt-0.5">{DESCRIPTIONS[key]}</p>
                    </div>

                    {/* Barras de dificultad */}
                    <DifficultyBars level={LEVEL[key]} color={cfg.color} />

                    {/* Chevron */}
                    <svg
                      className="w-4 h-4 text-(--color-text-muted) group-hover:text-(--color-text) transition-colors shrink-0"
                      viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}
                    >
                      <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </motion.button>
                )
              })}
            </motion.div>
          </section>

          {/* ── Rankings ── */}
          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.3 }}
          >
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/ranking')}
              className="w-full flex items-center gap-4 px-4 py-4 rounded-xl border border-(--color-border) bg-(--color-surface) hover:bg-(--color-surface-alt) transition-colors text-left"
            >
              <div className="w-10 h-10 rounded-xl bg-(--color-surface-alt) flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 text-(--color-primary)" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path d="M8 21H5a2 2 0 01-2-2v-1h18v1a2 2 0 01-2 2h-3" />
                  <path d="M12 3v10" />
                  <path d="M8 7l4-4 4 4" />
                  <rect x="9" y="13" width="6" height="5" rx="1" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="font-semibold text-(--color-text)">Rankings</p>
                <p className="text-xs text-(--color-text-muted)">Clasificación diaria y semanal</p>
              </div>
              <svg className="w-4 h-4 text-(--color-text-muted) shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </motion.button>
          </motion.section>

        </div>
      </main>
    </div>
  )
}
