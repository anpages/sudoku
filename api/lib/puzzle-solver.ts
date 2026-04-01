/**
 * Sudoku solver using constraint propagation + backtracking.
 * Returns:
 *   - null: no solution
 *   - string[81]: unique solution
 *   - 'multiple': more than one solution
 */

type Board = (number | null)[]

function boardFromString(s: string): Board {
  return Array.from(s).map((c) => {
    const n = parseInt(c, 10)
    return n === 0 ? null : n
  })
}

function boardToString(board: Board): string {
  return board.map((c) => (c === null ? '0' : c)).join('')
}

function peers(index: number): number[] {
  const row = Math.floor(index / 9)
  const col = index % 9
  const boxRow = Math.floor(row / 3) * 3
  const boxCol = Math.floor(col / 3) * 3
  const set = new Set<number>()
  for (let i = 0; i < 9; i++) {
    set.add(row * 9 + i) // same row
    set.add(i * 9 + col) // same col
    set.add((boxRow + Math.floor(i / 3)) * 9 + (boxCol + (i % 3))) // same box
  }
  set.delete(index)
  return [...set]
}

const PEERS: number[][] = Array.from({ length: 81 }, (_, i) => peers(i))

function getCandidates(board: Board): number[][] {
  return board.map((val, i) => {
    if (val !== null) return []
    const peerVals = new Set(PEERS[i].map((p) => board[p]).filter((v) => v !== null))
    return [1, 2, 3, 4, 5, 6, 7, 8, 9].filter((n) => !peerVals.has(n))
  })
}

type SolveResult = null | string | 'multiple'

function solve(board: Board, countLimit: number): { count: number; solution: string | null } {
  const candidates = getCandidates(board)

  // Find next empty cell with fewest candidates (MRV heuristic)
  let minLen = 10
  let minIdx = -1
  for (let i = 0; i < 81; i++) {
    if (board[i] !== null) continue
    const len = candidates[i].length
    if (len === 0) return { count: 0, solution: null } // contradiction
    if (len < minLen) {
      minLen = len
      minIdx = i
    }
  }

  if (minIdx === -1) {
    // All cells filled
    return { count: 1, solution: boardToString(board) }
  }

  let count = 0
  let solution: string | null = null
  for (const digit of candidates[minIdx]) {
    const next = board.slice()
    next[minIdx] = digit
    const result = solve(next, countLimit - count)
    count += result.count
    if (result.solution) solution = result.solution
    if (count >= countLimit) break
  }
  return { count, solution }
}

export function solvePuzzle(givens: string): SolveResult {
  const board = boardFromString(givens)
  const { count, solution } = solve(board, 2)
  if (count === 0) return null
  if (count >= 2) return 'multiple'
  return solution
}

export function hasUniqueSolution(givens: string): boolean {
  const board = boardFromString(givens)
  const { count } = solve(board, 2)
  return count === 1
}
