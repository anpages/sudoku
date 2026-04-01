import { useGameStore } from '@/store/game-store'
import { SudokuCell } from './SudokuCell'
import { BoardOverlay } from './BoardOverlay'

interface Props {
  onRestart?: () => void
}

export function SudokuBoard({ onRestart }: Props) {
  const status = useGameStore((s) => s.status)
  const flashingCells = useGameStore((s) => s.flashingCells)
  const cells = useGameStore((s) => s.cells)

  if (cells.length === 0) return null

  const flashSet = flashingCells ? new Set(flashingCells) : null

  return (
    <div className="relative w-full aspect-square">
      <div
        className="grid grid-cols-9 w-full h-full border-2 border-(--color-border-strong) rounded-sm overflow-hidden shadow-lg"
        role="grid"
        aria-label="Tablero de sudoku"
      >
        {Array.from({ length: 81 }, (_, i) => (
          <SudokuCell
            key={i}
            index={i}
            isFlashing={flashSet !== null && flashSet.has(i)}
          />
        ))}
      </div>

      {(status === 'paused' || status === 'failed') && (
        <BoardOverlay status={status} onRestart={onRestart} />
      )}
    </div>
  )
}
