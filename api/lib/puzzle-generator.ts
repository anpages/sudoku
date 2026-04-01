import { hasUniqueSolution } from './puzzle-solver'
import type { Difficulty } from '../../src/shared/types'
import { DIFFICULTY_CONFIG } from '../../src/shared/constants'

function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice()
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/**
 * Fill an empty 9×9 board with a valid solved Sudoku using backtracking.
 * Returns the 81-char solution string.
 */
function fillBoard(): string {
  const board: (number | null)[] = new Array(81).fill(null)

  function solve(idx: number): boolean {
    if (idx === 81) return true

    const row = Math.floor(idx / 9)
    const col = idx % 9
    const boxRow = Math.floor(row / 3) * 3
    const boxCol = Math.floor(col / 3) * 3

    const used = new Set<number>()
    for (let c = 0; c < 9; c++) used.add(board[row * 9 + c] ?? 0)
    for (let r = 0; r < 9; r++) used.add(board[r * 9 + col] ?? 0)
    for (let br = 0; br < 3; br++) {
      for (let bc = 0; bc < 3; bc++) {
        used.add(board[(boxRow + br) * 9 + (boxCol + bc)] ?? 0)
      }
    }

    const candidates = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9].filter((n) => !used.has(n)))
    for (const digit of candidates) {
      board[idx] = digit
      if (solve(idx + 1)) return true
      board[idx] = null
    }
    return false
  }

  solve(0)
  return board.map((n) => n ?? 0).join('')
}

/**
 * Generate a Sudoku puzzle with a unique solution at the given difficulty.
 * Returns { givens, solution } — solution is never sent to the client.
 */
export function generatePuzzle(difficulty: Difficulty): { givens: string; solution: string } {
  const solution = fillBoard()
  const config = DIFFICULTY_CONFIG[difficulty]
  const [minHoles, maxHoles] = config.holes
  const targetHoles = minHoles + Math.floor(Math.random() * (maxHoles - minHoles + 1))

  const board = solution.split('').map(Number)
  const indices = shuffle(Array.from({ length: 81 }, (_, i) => i))

  let holesRemoved = 0
  for (const idx of indices) {
    if (holesRemoved >= targetHoles) break

    const original = board[idx]
    board[idx] = 0

    const givensStr = board.map(String).join('')
    if (hasUniqueSolution(givensStr)) {
      holesRemoved++
    } else {
      board[idx] = original // restore — would create multiple solutions
    }
  }

  return {
    givens: board.map(String).join(''),
    solution,
  }
}
