import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { DIFFICULTY_CONFIG } from '@/shared/constants'
import type { Difficulty } from '@/shared/types'
import { Header } from '@/components/layout/Header'

export function Home() {
  const navigate = useNavigate()

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-8">
        <h1 className="text-2xl font-bold text-(--color-text) mb-2">Jugar</h1>
        <p className="text-(--color-text-muted) text-sm mb-8">Elige tu nivel de dificultad</p>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-10">
          {(Object.entries(DIFFICULTY_CONFIG) as [Difficulty, (typeof DIFFICULTY_CONFIG)[Difficulty]][]).map(
            ([key, config]) => (
              <motion.button
                key={key}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate(`/juego/${key}`)}
                className="flex flex-col items-start p-4 rounded-xl border-2 border-(--color-border) hover:shadow-md transition-all bg-(--color-surface)"
                style={{ '--hover-color': config.color } as React.CSSProperties}
              >
                <div
                  className="w-3 h-3 rounded-full mb-3"
                  style={{ backgroundColor: config.color }}
                />
                <span className="font-bold text-(--color-text) text-lg">{config.label}</span>
                <span className="text-xs text-(--color-text-muted) mt-1">
                  {config.holes[0]}–{config.holes[1]} celdas vacías
                </span>
              </motion.button>
            ),
          )}
        </div>

        <div className="flex gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/diario')}
            className="flex-1 flex items-center gap-3 p-5 rounded-xl bg-(--color-primary) text-white shadow-md"
          >
            <span className="text-2xl">📅</span>
            <div className="text-left">
              <p className="font-bold">Sudoku del día</p>
              <p className="text-xs opacity-80">Compite con todos los jugadores</p>
            </div>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/ranking')}
            className="flex-1 flex items-center gap-3 p-5 rounded-xl border-2 border-(--color-border) bg-(--color-surface)"
          >
            <span className="text-2xl">🏆</span>
            <div className="text-left">
              <p className="font-bold text-(--color-text)">Rankings</p>
              <p className="text-xs text-(--color-text-muted)">Diario y semanal</p>
            </div>
          </motion.button>
        </div>
      </main>
    </div>
  )
}
