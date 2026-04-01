import type { CellState } from '@/shared/types'
import { isPeer } from '@/store/game-store'

export function autoErasePencilMarks(
  cells: CellState[],
  index: number,
  digit: number,
): CellState[] {
  return cells.map((c, i) => {
    if (i === index) return c
    if (!isPeer(i, index)) return c
    if (!c.pencilMarks.includes(digit)) return c
    return { ...c, pencilMarks: c.pencilMarks.filter((m) => m !== digit) }
  })
}
