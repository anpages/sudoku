import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '@/store/game-store'
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

  // Thick borders for 3x3 boxes
  const borderRight = col === 2 || col === 5 ? 'border-r-2' : 'border-r'
  const borderBottom = row === 2 || row === 5 ? 'border-b-2' : 'border-b'
  const borderTop = row === 0 ? 'border-t-2' : row === 3 || row === 6 ? 'border-t-2' : 'border-t'
  const borderLeft = col === 0 ? 'border-l-2' : col === 3 || col === 6 ? 'border-l-2' : 'border-l'

  let bgClass = 'bg-(--color-surface)'
  if (isFlashing) bgClass = 'bg-amber-200 dark:bg-amber-400/30'
  else if (highlight === 'error') bgClass = 'bg-(--color-cell-error-bg)'
  else if (highlight === 'selected') bgClass = 'bg-(--color-cell-selected)'
  else if (highlight === 'same-number') bgClass = 'bg-(--color-cell-same-number)'
  else if (highlight === 'highlight') bgClass = 'bg-(--color-cell-highlight)'
  else if (cell.isGiven) bgClass = 'bg-(--color-cell-given)'

  const textClass = cell.isGiven
    ? 'text-(--color-text-given) font-bold'
    : highlight === 'error'
      ? 'text-(--color-text-error) font-semibold'
      : 'text-(--color-text-input) font-semibold'

  return (
    <motion.div
      className={[
        'relative flex items-center justify-center cursor-pointer select-none',
        'border-(--color-border)',
        borderRight, borderBottom, borderTop, borderLeft,
        bgClass,
        'transition-colors duration-100',
        'aspect-square',
      ].join(' ')}
      onClick={() => selectCell(index)}
      whileTap={!cell.isGiven ? { scale: 0.92 } : undefined}
      animate={isFlashing ? { scale: [1, 1.08, 1] } : { scale: 1 }}
      transition={{ duration: 0.8 }}
    >
      {cell.value !== null ? (
        <span
          className={[
            'text-[clamp(16px,3.4vmin,28px)] leading-none',
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
              className="absolute inset-0 grid grid-cols-3 grid-rows-3 p-[2px]"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                <span
                  key={n}
                  className="flex items-center justify-center text-[clamp(9px,2vmin,12px)] text-(--color-text-pencil) font-medium leading-none"
                >
                  {cell.pencilMarks.includes(n) ? n : ''}
                </span>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </motion.div>
  )
}
