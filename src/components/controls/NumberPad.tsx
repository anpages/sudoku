import { motion } from 'framer-motion'
import { useGameStore } from '@/store/game-store'

export function NumberPad() {
  const enterValue = useGameStore((s) => s.enterValue)
  const eraseCell = useGameStore((s) => s.eraseCell)
  const cells = useGameStore((s) => s.cells)
  const status = useGameStore((s) => s.status)
  const locked = useGameStore((s) => s.locked)

  const disabled = status !== 'playing' || locked

  function getRemainingCount(digit: number) {
    const placed = cells.filter((c) => c.value === digit).length
    return Math.max(0, 9 - placed)
  }

  return (
    <div className="flex gap-2 justify-center flex-wrap max-w-[min(90vw,480px)] lg:max-w-[min(calc(100vh-200px),560px)] mx-auto">
      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => {
        const remaining = getRemainingCount(n)
        const complete = remaining === 0
        return (
          <motion.button
            key={n}
            onClick={() => !disabled && !complete && enterValue(n)}
            disabled={disabled || complete}
            whileTap={!disabled && !complete ? { scale: 0.88 } : undefined}
            className={[
              'relative flex flex-col items-center justify-center',
              'w-[clamp(36px,9vw,52px)] h-[clamp(44px,11vw,64px)]',
              'rounded-lg font-bold text-[clamp(18px,4vw,28px)]',
              'border-2 transition-all duration-150',
              complete
                ? 'opacity-20 cursor-not-allowed border-(--color-border)'
                : disabled
                  ? 'opacity-40 cursor-not-allowed border-(--color-border)'
                  : 'border-(--color-border) hover:border-(--color-primary) hover:bg-(--color-cell-highlight) cursor-pointer active:scale-90',
              'text-(--color-text)',
            ].join(' ')}
          >
            <span>{n}</span>
            {!complete && (
              <span className="absolute bottom-1 text-[8px] text-(--color-text-muted) font-normal leading-none">
                {remaining}
              </span>
            )}
          </motion.button>
        )
      })}
      <motion.button
        onClick={() => !disabled && eraseCell()}
        disabled={disabled}
        whileTap={!disabled ? { scale: 0.88 } : undefined}
        className={[
          'flex items-center justify-center',
          'w-[clamp(36px,9vw,52px)] h-[clamp(44px,11vw,64px)]',
          'rounded-lg border-2 transition-all duration-150',
          disabled
            ? 'opacity-40 cursor-not-allowed border-(--color-border)'
            : 'border-(--color-border) hover:border-(--color-primary) hover:bg-(--color-cell-highlight) cursor-pointer',
        ].join(' ')}
        title="Borrar"
      >
        <svg className="w-5 h-5 text-(--color-text-muted)" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <path d="M20 5H9l-7 7 7 7h11a2 2 0 002-2V7a2 2 0 00-2-2z" />
          <line x1="18" y1="9" x2="12" y2="15" />
          <line x1="12" y1="9" x2="18" y2="15" />
        </svg>
      </motion.button>
    </div>
  )
}
