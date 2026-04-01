import { motion } from 'framer-motion'
import { useGameStore } from '@/store/game-store'

export function NumberPad() {
  const enterValue = useGameStore((s) => s.enterValue)
  const cells = useGameStore((s) => s.cells)
  const status = useGameStore((s) => s.status)
  const locked = useGameStore((s) => s.locked)

  const disabled = status !== 'playing' || locked

  function getRemainingCount(digit: number) {
    const placed = cells.filter((c) => c.value === digit).length
    return Math.max(0, 9 - placed)
  }

  return (
    <div className="grid grid-cols-3 gap-2 w-full">
      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => {
        const remaining = getRemainingCount(n)
        const complete = remaining === 0
        return (
          <motion.button
            key={n}
            onClick={() => !disabled && !complete && enterValue(n)}
            disabled={disabled || complete}
            whileTap={!disabled && !complete ? { scale: 0.93 } : undefined}
            className={[
              'relative flex flex-col items-center justify-center',
              'rounded-xl transition-all duration-100',
              'py-4 lg:py-5',
              complete
                ? 'opacity-15 cursor-not-allowed bg-(--color-surface-alt) text-(--color-text)'
                : disabled
                  ? 'opacity-30 cursor-not-allowed bg-(--color-surface-alt) text-(--color-text)'
                  : 'bg-(--color-surface-alt) hover:bg-(--color-cell-selected) active:bg-(--color-cell-selected) cursor-pointer text-(--color-primary)',
            ].join(' ')}
          >
            <span className="text-2xl lg:text-3xl font-semibold leading-none">{n}</span>
            {!complete && (
              <span className="text-[10px] lg:text-xs text-(--color-text-muted) font-normal mt-1 leading-none">
                {remaining}
              </span>
            )}
          </motion.button>
        )
      })}
    </div>
  )
}
