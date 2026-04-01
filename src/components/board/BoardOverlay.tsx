import { motion } from 'framer-motion'
import { useTimerStore } from '@/store/timer-store'
import { useGameStore } from '@/store/game-store'
import type { GameStatus } from '@/store/game-store'

interface Props {
  status: GameStatus
  onRestart?: () => void
}

export function BoardOverlay({ status, onRestart }: Props) {
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
          <p className="text-(--color-text) font-semibold text-lg mb-5">Juego en pausa</p>
          <button
            onClick={handleResume}
            className="px-6 py-3 bg-(--color-primary) text-white rounded-xl font-semibold text-sm hover:opacity-90 transition-opacity"
          >
            Continuar
          </button>
        </>
      ) : (
        <>
          <p className="text-(--color-text) font-bold text-xl mb-1">¡3 errores!</p>
          <p className="text-(--color-text-muted) text-sm mb-6">Inténtalo de nuevo</p>
          {onRestart && (
            <button
              onClick={onRestart}
              className="px-6 py-3 bg-(--color-primary) text-white rounded-xl font-semibold text-sm hover:opacity-90 transition-opacity"
            >
              Reiniciar
            </button>
          )}
        </>
      )}
    </motion.div>
  )
}
