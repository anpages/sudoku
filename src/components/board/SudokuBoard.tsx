import { useGameStore } from '@/store/game-store'
import { SudokuCell } from './SudokuCell'
import { BoardOverlay } from './BoardOverlay'

export function SudokuBoard() {
  const status = useGameStore((s) => s.status)
  const flashingDigit = useGameStore((s) => s.flashingDigit)
  const cells = useGameStore((s) => s.cells)

  if (cells.length === 0) return null

  const flashingIndices = flashingDigit
    ? cells.reduce<number[]>((acc, c, i) => {
        if (c.value === flashingDigit) acc.push(i)
        return acc
      }, [])
    : []

  return (
    <div className="relative w-full max-w-[min(90vw,calc(90vh-280px),480px)] lg:max-w-[min(calc(100vh-200px),560px)] aspect-square mx-auto">
      <div
        className="grid grid-cols-9 w-full h-full border-2 border-(--color-border-strong) rounded-sm overflow-hidden shadow-lg"
        role="grid"
        aria-label="Tablero de sudoku"
      >
        {Array.from({ length: 81 }, (_, i) => (
          <SudokuCell
            key={i}
            index={i}
            isFlashing={flashingIndices.includes(i)}
          />
        ))}
      </div>

      {(status === 'paused' || status === 'failed') && (
        <BoardOverlay status={status} />
      )}
    </div>
  )
}
