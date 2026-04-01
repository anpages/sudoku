import { motion } from 'framer-motion'
import { useTimerStore } from '@/store/timer-store'
import { useGameStore } from '@/store/game-store'
import type { GameStatus } from '@/store/game-store'

interface Props {
  status: GameStatus
}

export function BoardOverlay({ status }: Props) {
  const resume = useTimerStore((s) => s.resume)
  const setPaused = useGameStore((s) => s.setPaused)

  function handleResume() {
    setPaused(false)
    resume()
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="absolute inset-0 flex flex-col items-center justify-center rounded-sm backdrop-blur-md bg-(--color-surface)/80 z-10"
    >
      {status === 'paused' ? (
        <>
          <div className="text-4xl mb-4">⏸</div>
          <p className="text-(--color-text) font-semibold text-lg mb-6">Juego en pausa</p>
          <button
            onClick={handleResume}
            className="px-6 py-3 bg-(--color-primary) text-white rounded-lg font-semibold text-sm hover:bg-(--color-primary-dark) transition-colors"
          >
            Continuar
          </button>
        </>
      ) : (
        <>
          <div className="text-4xl mb-4">💀</div>
          <p className="text-(--color-text) font-semibold text-lg mb-2">¡3 errores!</p>
          <p className="text-(--color-text-muted) text-sm">Debes empezar de nuevo</p>
        </>
      )}
    </motion.div>
  )
}
