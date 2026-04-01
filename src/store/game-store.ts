import { create } from 'zustand'
import type { CellState, Difficulty } from '@/shared/types'
import { MAX_ERRORS, FLASH_DURATION_MS } from '@/shared/constants'

export type GameStatus = 'idle' | 'playing' | 'paused' | 'complete' | 'failed'

interface GameStore {
  cells: CellState[]
  selected: number | null     // 0-80 index
  pencilMode: boolean
  errors: number
  hintsUsed: number
  status: GameStatus
  puzzleId: string | null
  sessionToken: string | null
  difficulty: Difficulty | null
  flashingDigit: number | null  // 1-9, null = not flashing
  locked: boolean               // true during flash or when paused

  // Actions
  initGame: (params: {
    givens: string
    puzzleId: string
    sessionToken: string
    difficulty: Difficulty
  }) => void
  selectCell: (index: number) => void
  enterValue: (digit: number) => void
  togglePencilMark: (digit: number) => void
  eraseCell: () => void
  useHint: (solution: string) => void
  setPaused: (paused: boolean) => void
  setComplete: () => void
  setFailed: () => void
  reset: () => void
}

function parseCells(givens: string): CellState[] {
  return Array.from(givens).map((ch) => {
    const v = parseInt(ch, 10)
    return {
      value: v === 0 ? null : v,
      isGiven: v !== 0,
      pencilMarks: [],
      isError: false,
    }
  })
}

function isSameBox(a: number, b: number) {
  return Math.floor(a / 27) === Math.floor(b / 27) &&
    Math.floor((a % 9) / 3) === Math.floor((b % 9) / 3)
}

export function isPeer(a: number, b: number) {
  if (a === b) return false
  const ar = Math.floor(a / 9), ac = a % 9
  const br = Math.floor(b / 9), bc = b % 9
  return ar === br || ac === bc || isSameBox(a, b)
}

export const useGameStore = create<GameStore>()((set, get) => ({
  cells: [],
  selected: null,
  pencilMode: false,
  errors: 0,
  hintsUsed: 0,
  status: 'idle',
  puzzleId: null,
  sessionToken: null,
  difficulty: null,
  flashingDigit: null,
  locked: false,

  initGame: ({ givens, puzzleId, sessionToken, difficulty }) => {
    set({
      cells: parseCells(givens),
      selected: null,
      pencilMode: false,
      errors: 0,
      hintsUsed: 0,
      status: 'playing',
      puzzleId,
      sessionToken,
      difficulty,
      flashingDigit: null,
      locked: false,
    })
  },

  selectCell: (index) => {
    const { status, locked } = get()
    if (status !== 'playing' || locked) return
    set({ selected: index })
  },

  enterValue: (digit) => {
    const { cells, selected, pencilMode, status, locked, errors } = get()
    if (status !== 'playing' || locked || selected === null) return
    const cell = cells[selected]
    if (cell.isGiven) return

    if (pencilMode) {
      get().togglePencilMark(digit)
      return
    }

    const next = cells.map((c, i) => {
      if (i !== selected) return c
      return { ...c, value: digit, pencilMarks: [], isError: false }
    })

    // Clear peer pencil marks
    const updated = next.map((c, i) => {
      if (i === selected || !isPeer(i, selected)) return c
      if (c.pencilMarks.includes(digit)) {
        return { ...c, pencilMarks: c.pencilMarks.filter((m) => m !== digit) }
      }
      return c
    })

    // Detect conflicts (client shows same-peer duplicates, server validates correctness)
    const withConflicts = updated.map((c, i) => {
      if (c.value === null || c.isGiven) return c
      const hasConflict = updated.some(
        (other, j) => j !== i && isPeer(i, j) && other.value === c.value,
      )
      return { ...c, isError: hasConflict }
    })
    set({ cells: withConflicts })

    // Count new errors (only for the just-placed cell)
    if (withConflicts[selected].isError) {
      const nextErrors = errors + 1
      set({ errors: nextErrors })
      if (nextErrors >= MAX_ERRORS) {
        get().setFailed()
        return
      }
    }

    // Check if this digit is now fully placed (all 9 instances)
    const count = withConflicts.filter((c) => c.value === digit).length
    if (count === 9) {
      set({ flashingDigit: digit, locked: true })
      setTimeout(() => set({ flashingDigit: null, locked: false }), FLASH_DURATION_MS)
    }

    // Check completion: all filled AND no conflicts anywhere on the board
    const allFilled = withConflicts.every((c) => c.value !== null)
    const hasAnyConflict = withConflicts.some((c) => c.isError)
    if (allFilled && !hasAnyConflict) get().setComplete()
  },

  togglePencilMark: (digit) => {
    const { cells, selected, status, locked } = get()
    if (status !== 'playing' || locked || selected === null) return
    const cell = cells[selected]
    if (cell.isGiven || cell.value !== null) return

    const marks = cell.pencilMarks.includes(digit)
      ? cell.pencilMarks.filter((m) => m !== digit)
      : [...cell.pencilMarks, digit].sort((a, b) => a - b)

    set({
      cells: cells.map((c, i) => i === selected ? { ...c, pencilMarks: marks } : c),
    })
  },

  eraseCell: () => {
    const { cells, selected, status, locked } = get()
    if (status !== 'playing' || locked || selected === null) return
    const cell = cells[selected]
    if (cell.isGiven) return

    set({
      cells: cells.map((c, i) =>
        i === selected ? { ...c, value: null, pencilMarks: [], isError: false } : c,
      ),
    })
  },

  useHint: (solution: string) => {
    const { cells, selected, status, locked, hintsUsed } = get()
    if (status !== 'playing' || locked || selected === null) return
    const cell = cells[selected]
    if (cell.isGiven || cell.value !== null) return

    const correctDigit = parseInt(solution[selected], 10)
    const next = cells.map((c, i) =>
      i === selected
        ? { ...c, value: correctDigit, isGiven: true, pencilMarks: [], isError: false }
        : c,
    )
    set({ cells: next, hintsUsed: hintsUsed + 1 })

    const allFilled = next.every((c) => c.value !== null)
    if (allFilled) get().setComplete()
  },

  setPaused: (paused) => {
    set({ status: paused ? 'paused' : 'playing', locked: paused })
  },

  setComplete: () => set({ status: 'complete', locked: true }),
  setFailed: () => set({ status: 'failed', locked: true }),

  reset: () => set({
    cells: [],
    selected: null,
    pencilMode: false,
    errors: 0,
    hintsUsed: 0,
    status: 'idle',
    puzzleId: null,
    sessionToken: null,
    difficulty: null,
    flashingDigit: null,
    locked: false,
  }),
}))
