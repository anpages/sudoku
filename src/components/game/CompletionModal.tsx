import { motion } from 'framer-motion'
import { formatTime } from '@/shared/scoring'
import { DIFFICULTY_CONFIG } from '@/shared/constants'
import type { Difficulty } from '@/shared/types'

interface Props {
  difficulty: Difficulty
  elapsedSeconds: number
  hintsUsed: number
  errorsMade: number
  adjustedTime: number
  rank: number | null
  onPlayAgain: () => void
  onHome: () => void
}

export function CompletionModal({
  difficulty,
  elapsedSeconds,
  hintsUsed,
  errorsMade,
  adjustedTime,
  rank,
  onPlayAgain,
  onHome,
}: Props) {
  const config = DIFFICULTY_CONFIG[difficulty]

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className="bg-(--color-surface) rounded-2xl shadow-2xl p-8 w-full max-w-sm text-center"
      >
        <div className="text-5xl mb-4">🎉</div>
        <h2 className="text-2xl font-bold text-(--color-text) mb-1">¡Completado!</h2>
        <p className="text-(--color-text-muted) text-sm mb-6" style={{ color: config.color }}>
          {config.label}
        </p>

        <div className="space-y-3 mb-6">
          <div className="flex justify-between items-center py-2 border-b border-(--color-border)">
            <span className="text-(--color-text-muted) text-sm">Tiempo</span>
            <span className="font-semibold text-(--color-text)">{formatTime(elapsedSeconds)}</span>
          </div>
          {hintsUsed > 0 && (
            <div className="flex justify-between items-center py-2 border-b border-(--color-border)">
              <span className="text-(--color-text-muted) text-sm">Pistas (+{hintsUsed * 30}s)</span>
              <span className="font-semibold text-amber-500">+{hintsUsed}</span>
            </div>
          )}
          {errorsMade > 0 && (
            <div className="flex justify-between items-center py-2 border-b border-(--color-border)">
              <span className="text-(--color-text-muted) text-sm">Errores (+{errorsMade * 15}s)</span>
              <span className="font-semibold text-red-500">+{errorsMade}</span>
            </div>
          )}
          <div className="flex justify-between items-center py-2">
            <span className="text-(--color-text-muted) text-sm font-semibold">Tiempo final</span>
            <span className="font-bold text-lg text-(--color-primary)">{formatTime(adjustedTime)}</span>
          </div>
        </div>

        {rank !== null && (
          <div className="bg-(--color-surface-alt) rounded-xl py-3 mb-6">
            <p className="text-(--color-text-muted) text-xs mb-1">Tu posición en el ranking diario</p>
            <p className="text-3xl font-bold text-(--color-primary)">#{rank}</p>
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={onHome}
            className="flex-1 py-3 rounded-xl border-2 border-(--color-border) text-(--color-text) font-semibold hover:bg-(--color-surface-alt) transition-colors"
          >
            Inicio
          </button>
          <button
            onClick={onPlayAgain}
            className="flex-1 py-3 rounded-xl bg-(--color-primary) text-white font-semibold hover:bg-(--color-primary-dark) transition-colors"
          >
            Jugar otra
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}
