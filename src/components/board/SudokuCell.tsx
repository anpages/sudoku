import { AnimatePresence, motion } from 'framer-motion'
import { useGameStore, isPeer } from '@/store/game-store'
import { getCellHighlight } from '@/engine/highlighter'

interface Props {
  index: number
  isFlashing: boolean
}

export function SudokuCell({ index, isFlashing }: Props) {
  const cell = useGameStore((s) => s.cells[index])
  const selected = useGameStore((s) => s.selected)
  const cells = useGameStore((s) => s.cells)
  const selectCell = useGameStore((s) => s.selectCell)

  if (!cell) return null

  const highlight = getCellHighlight(index, selected, cells)

  const row = Math.floor(index / 9)
  const col = index % 9

  // Box borders: thicker at 3×3 boundaries
  const borderClasses = [
    col % 3 === 0 && col !== 0 ? 'border-l-[2px]' : 'border-l-[0.5px]',
    row % 3 === 0 && row !== 0 ? 'border-t-[2px]' : 'border-t-[0.5px]',
  ].join(' ')

  let bgClass = 'bg-(--color-surface)'
  if (isFlashing) bgClass = 'bg-amber-100 dark:bg-amber-500/20'
  else if (highlight === 'error') bgClass = 'bg-(--color-cell-error-bg)'
  else if (highlight === 'selected') bgClass = 'bg-(--color-cell-selected)'
  else if (highlight === 'same-number') bgClass = 'bg-(--color-cell-same-number)'
  else if (highlight === 'highlight') bgClass = 'bg-(--color-cell-highlight)'

  const textClass = cell.isGiven
    ? 'text-(--color-text-given)'
    : highlight === 'error'
      ? 'text-(--color-text-error)'
      : 'text-(--color-text-input)'

  return (
    <motion.div
      className={[
        'relative flex items-center justify-center cursor-pointer select-none',
        'border-(--color-border)',
        borderClasses,
        bgClass,
        'transition-colors duration-75',
        'aspect-square',
      ].join(' ')}
      onClick={() => selectCell(index)}
      animate={isFlashing ? { scale: [1, 1.05, 1] } : { scale: 1 }}
      transition={{ duration: 0.6 }}
    >
      {cell.value !== null ? (
        <span
          className={[
            'text-[clamp(18px,4.5vmin,32px)] leading-none font-medium',
            textClass,
          ].join(' ')}
        >
          {cell.value}
        </span>
      ) : (
        <AnimatePresence>
          {cell.pencilMarks.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0"
            >
              <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 p-[1px]">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => {
                  const has = cell.pencilMarks.includes(n)
                  const invalid = has && cells.some((c, j) => isPeer(j, index) && c.value === n)
                  return (
                    <span
                      key={n}
                      className={[
                        'flex items-center justify-center text-[clamp(8px,2vmin,12px)] font-semibold leading-none transition-opacity',
                        has
                          ? invalid
                            ? 'text-(--color-text-pencil) opacity-25 line-through'
                            : 'text-(--color-text-pencil)'
                          : 'opacity-0',
                      ].join(' ')}
                    >
                      {n}
                    </span>
                  )
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </motion.div>
  )
}
