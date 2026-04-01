import { isPeer } from '@/store/game-store'
import type { CellState } from '@/shared/types'

export type CellHighlight = 'selected' | 'highlight' | 'same-number' | 'error' | null

export function getCellHighlight(
  index: number,
  selected: number | null,
  cells: CellState[],
): CellHighlight {
  if (cells[index].isError) return 'error'
  if (index === selected) return 'selected'
  if (selected === null) return null

  const selectedCell = cells[selected]
  const thisCell = cells[index]

  if (
    selectedCell.value !== null &&
    thisCell.value === selectedCell.value
  ) return 'same-number'

  if (isPeer(index, selected)) return 'highlight'

  return null
}
