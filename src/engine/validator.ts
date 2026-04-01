import type { CellState } from '@/shared/types'
import { isPeer } from '@/store/game-store'

export function getConflicts(cells: CellState[]): Set<number> {
  const conflicts = new Set<number>()
  for (let i = 0; i < 81; i++) {
    const ci = cells[i]
    if (ci.value === null || ci.isGiven) continue
    for (let j = i + 1; j < 81; j++) {
      const cj = cells[j]
      if (cj.value === null) continue
      if (ci.value === cj.value && isPeer(i, j)) {
        conflicts.add(i)
        conflicts.add(j)
      }
    }
  }
  return conflicts
}
