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

  const baseBtn = [
    'relative flex flex-col items-center justify-center',
    'rounded-lg border-2 transition-all duration-150',
    'aspect-square w-full',
  ].join(' ')

  return (
    // 5-column grid: row 1 → 1–5, row 2 → 6–9 + erase
    <div className="grid grid-cols-5 gap-2 w-full">
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
              baseBtn,
              'text-[clamp(16px,4.5vw,26px)] font-bold',
              complete
                ? 'opacity-20 cursor-not-allowed border-(--color-border) text-(--color-text)'
                : disabled
                  ? 'opacity-40 cursor-not-allowed border-(--color-border) text-(--color-text)'
                  : 'border-(--color-border) hover:border-(--color-primary) hover:bg-(--color-cell-highlight) cursor-pointer text-(--color-text)',
            ].join(' ')}
          >
            <span className="leading-none">{n}</span>
            {!complete && (
              <span className="absolute bottom-[3px] text-[clamp(7px,1.5vw,9px)] text-(--color-text-muted) font-normal leading-none">
                {remaining}
              </span>
            )}
          </motion.button>
        )
      })}

      {/* Erase button — fills 5th column of row 2 */}
      <motion.button
        onClick={() => !disabled && eraseCell()}
        disabled={disabled}
        whileTap={!disabled ? { scale: 0.88 } : undefined}
        className={[
          baseBtn,
          disabled
            ? 'opacity-40 cursor-not-allowed border-(--color-border)'
            : 'border-(--color-border) hover:border-(--color-primary) hover:bg-(--color-cell-highlight) cursor-pointer',
        ].join(' ')}
        title="Borrar"
      >
        <svg className="w-[clamp(16px,4vw,22px)] h-[clamp(16px,4vw,22px)] text-(--color-text-muted)" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <path d="M20 5H9l-7 7 7 7h11a2 2 0 002-2V7a2 2 0 00-2-2z" />
          <line x1="18" y1="9" x2="12" y2="15" />
          <line x1="12" y1="9" x2="18" y2="15" />
        </svg>
      </motion.button>
    </div>
  )
}
