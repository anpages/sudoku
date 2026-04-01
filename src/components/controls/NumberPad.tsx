import { motion } from 'framer-motion'
import { useGameStore } from '@/store/game-store'

function DigitButton({ digit, disabled }: { digit: number; disabled: boolean }) {
  const enterValue = useGameStore((s) => s.enterValue)
  const cells = useGameStore((s) => s.cells)

  const remaining = Math.max(0, 9 - cells.filter((c) => c.value === digit).length)
  const complete = remaining === 0

  return (
    <motion.button
      onClick={() => !disabled && !complete && enterValue(digit)}
      disabled={disabled || complete}
      whileTap={!disabled && !complete ? { scale: 0.93 } : undefined}
      className={[
        'relative flex flex-col items-center justify-center',
        'rounded-xl transition-all duration-100',
        'py-3 lg:py-5',
        complete
          ? 'opacity-15 cursor-not-allowed bg-(--color-surface-alt) text-(--color-text)'
          : disabled
            ? 'opacity-30 cursor-not-allowed bg-(--color-surface-alt) text-(--color-text)'
            : 'bg-(--color-surface-alt) hover:bg-(--color-cell-selected) active:bg-(--color-cell-selected) cursor-pointer text-(--color-primary)',
      ].join(' ')}
    >
      <span className="text-xl lg:text-3xl font-semibold leading-none">{digit}</span>
      {!complete && (
        <span className="text-[10px] lg:text-xs text-(--color-text-muted) font-normal mt-0.5 lg:mt-1 leading-none">
          {remaining}
        </span>
      )}
    </motion.button>
  )
}

function EraseButton({ disabled }: { disabled: boolean }) {
  const eraseCell = useGameStore((s) => s.eraseCell)

  return (
    <motion.button
      onClick={() => !disabled && eraseCell()}
      disabled={disabled}
      whileTap={!disabled ? { scale: 0.93 } : undefined}
      className={[
        'relative flex flex-col items-center justify-center',
        'rounded-xl transition-all duration-100',
        'py-3',
        disabled
          ? 'opacity-30 cursor-not-allowed bg-(--color-surface-alt) text-(--color-text-muted)'
          : 'bg-(--color-surface-alt) hover:bg-(--color-cell-selected) active:bg-(--color-cell-selected) cursor-pointer text-(--color-text-muted)',
      ].join(' ')}
    >
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
        <path d="M20 5H9l-7 7 7 7h11a2 2 0 002-2V7a2 2 0 00-2-2z" />
        <line x1="18" y1="9" x2="12" y2="15" />
        <line x1="12" y1="9" x2="18" y2="15" />
      </svg>
    </motion.button>
  )
}

export function NumberPad() {
  const status = useGameStore((s) => s.status)
  const locked = useGameStore((s) => s.locked)
  const disabled = status !== 'playing' || locked

  return (
    <>
      {/* Mobile: 2 rows — top 1-5, bottom 6-9 + erase */}
      <div className="flex flex-col gap-2 w-full lg:hidden">
        <div className="grid grid-cols-5 gap-2">
          {[1, 2, 3, 4, 5].map((n) => (
            <DigitButton key={n} digit={n} disabled={disabled} />
          ))}
        </div>
        <div className="grid grid-cols-5 gap-2">
          {[6, 7, 8, 9].map((n) => (
            <DigitButton key={n} digit={n} disabled={disabled} />
          ))}
          <EraseButton disabled={disabled} />
        </div>
      </div>

      {/* Desktop: 3 columns grid */}
      <div className="hidden lg:grid grid-cols-3 gap-2 w-full">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
          <DigitButton key={n} digit={n} disabled={disabled} />
        ))}
      </div>
    </>
  )
}
