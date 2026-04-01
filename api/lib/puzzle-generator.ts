import { hasUniqueSolution } from './puzzle-solver.js'
import type { Difficulty } from '../../src/shared/types.js'
import { DIFFICULTY_CONFIG } from '../../src/shared/constants.js'

function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice()
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/** Verify a 81-char string is a valid completed Sudoku (rows, cols, boxes all have 1-9). */
function isValidSolution(sol: string): boolean {
  if (sol.length !== 81) return false
  for (let i = 0; i < 81; i++) {
    const d = parseInt(sol[i], 10)
    if (d < 1 || d > 9) return false
  }
  for (let r = 0; r < 9; r++) {
    const row = new Set<string>()
    const col = new Set<string>()
    for (let c = 0; c < 9; c++) {
      row.add(sol[r * 9 + c])
      col.add(sol[c * 9 + r])
    }
    if (row.size !== 9 || col.size !== 9) return false
  }
  for (let br = 0; br < 3; br++) {
    for (let bc = 0; bc < 3; bc++) {
      const box = new Set<string>()
      for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
          box.add(sol[(br * 3 + r) * 9 + (bc * 3 + c)])
        }
      }
      if (box.size !== 9) return false
    }
  }
  return true
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
    for (let c = 0; c < 9; c++) {
      const v = board[row * 9 + c]
      if (v !== null) used.add(v)
    }
    for (let r = 0; r < 9; r++) {
      const v = board[r * 9 + col]
      if (v !== null) used.add(v)
    }
    for (let br = 0; br < 3; br++) {
      for (let bc = 0; bc < 3; bc++) {
        const v = board[(boxRow + br) * 9 + (boxCol + bc)]
        if (v !== null) used.add(v)
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
 * Dig holes from a solved board, maintaining unique solvability.
 * Uses multiple shuffled passes to maximise the number of holes.
 */
function digHoles(solution: string, targetHoles: number): string {
  const board = solution.split('').map(Number)
  const indices = shuffle(Array.from({ length: 81 }, (_, i) => i))

  let holesRemoved = 0
  for (const idx of indices) {
    if (holesRemoved >= targetHoles) break

    const original = board[idx]
    board[idx] = 0

    if (hasUniqueSolution(board.map(String).join(''))) {
      holesRemoved++
    } else {
      board[idx] = original
    }
  }

  // If we didn't reach the target (can happen at high difficulty),
  // do a second pass with a fresh shuffle of the remaining filled cells.
  if (holesRemoved < targetHoles) {
    const remaining = shuffle(
      Array.from({ length: 81 }, (_, i) => i).filter((i) => board[i] !== 0),
    )
    for (const idx of remaining) {
      if (holesRemoved >= targetHoles) break

      const original = board[idx]
      board[idx] = 0

      if (hasUniqueSolution(board.map(String).join(''))) {
        holesRemoved++
      } else {
        board[idx] = original
      }
    }
  }

  return board.map(String).join('')
}

/**
 * Generate a Sudoku puzzle with a unique solution at the given difficulty.
 * Returns { givens, solution } — solution is never sent to the client.
 */
export function generatePuzzle(difficulty: Difficulty): { givens: string; solution: string } {
  const config = DIFFICULTY_CONFIG[difficulty]
  const [minHoles, maxHoles] = config.holes
  const targetHoles = minHoles + Math.floor(Math.random() * (maxHoles - minHoles + 1))

  // Retry up to 3 times to produce a valid puzzle
  for (let attempt = 0; attempt < 3; attempt++) {
    const solution = fillBoard()

    if (!isValidSolution(solution)) continue

    const givens = digHoles(solution, targetHoles)

    // Final safety check: the puzzle must have a unique solution
    if (hasUniqueSolution(givens)) {
      return { givens, solution }
    }
  }

  // Fallback: generate a simple puzzle with fewer holes
  const solution = fillBoard()
  const givens = digHoles(solution, minHoles)
  return { givens, solution }
}
