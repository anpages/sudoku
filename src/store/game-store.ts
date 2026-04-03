import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CellState, Difficulty } from '@/shared/types'
import { MAX_ERRORS, FLASH_DURATION_MS } from '@/shared/constants'
import { useTimerStore } from '@/store/timer-store'

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
  givens: string | null
  solution: string | null
  isDaily: boolean
  flashingCells: number[] | null  // indices to flash, null = not flashing
  locked: boolean               // true during flash or when paused

  // Actions
  initGame: (params: {
    givens: string
    puzzleId: string
    sessionToken: string
    difficulty: Difficulty
    solution: string
  }) => void
  selectCell: (index: number) => void
  enterValue: (digit: number) => void
  togglePencilMark: (digit: number) => void
  eraseCell: () => void
  useHint: (index: number, digit: number) => void
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

/** Collect cell indices from newly-completed rows or boxes. */
function getCompletedCells(cells: CellState[], placedIndex: number): number[] {
  const flashSet = new Set<number>()

  // 1. Row complete
  const row = Math.floor(placedIndex / 9)
  const rowStart = row * 9
  const rowCells = Array.from({ length: 9 }, (_, i) => rowStart + i)
  if (rowCells.every((i) => cells[i].value !== null)) {
    for (const i of rowCells) flashSet.add(i)
  }

  // 3. Box complete
  const boxRow = Math.floor(row / 3) * 3
  const boxCol = Math.floor((placedIndex % 9) / 3) * 3
  const boxCells: number[] = []
  for (let r = boxRow; r < boxRow + 3; r++) {
    for (let c = boxCol; c < boxCol + 3; c++) {
      boxCells.push(r * 9 + c)
    }
  }
  if (boxCells.every((i) => cells[i].value !== null)) {
    for (const i of boxCells) flashSet.add(i)
  }

  return Array.from(flashSet)
}

/** Recompute isError for every non-given cell.
 *  With solution: flags any cell whose value doesn't match the solution.
 *  Without solution (fallback): flags peer conflicts. */
function recomputeErrors(cells: CellState[], solution: string | null): CellState[] {
  return cells.map((c, i) => {
    if (c.value === null || c.isGiven) return c.isError ? { ...c, isError: false } : c
    const hasError = solution
      ? c.value !== parseInt(solution[i], 10)
      : cells.some((other, j) => j !== i && isPeer(i, j) && other.value === c.value)
    return c.isError !== hasError ? { ...c, isError: hasError } : c
  })
}

export const useGameStore = create<GameStore>()(
  persist(
  (set, get) => ({
  cells: [],
  selected: null,
  pencilMode: false,
  errors: 0,
  hintsUsed: 0,
  status: 'idle',
  puzzleId: null,
  sessionToken: null,
  difficulty: null,
  givens: null,
  solution: null,
  isDaily: false,
  flashingCells: null,
  locked: false,

  initGame: ({ givens, puzzleId, sessionToken, difficulty, solution }) => {
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
      givens,
      solution,
      isDaily: false,
      flashingCells: null,
      locked: false,
    })
  },

  selectCell: (index) => {
    const { status, locked } = get()
    if (status !== 'playing' || locked) return
    set({ selected: index })
  },

  enterValue: (digit) => {
    const { cells, selected, pencilMode, status, locked, errors, solution } = get()
    if (status !== 'playing' || locked || selected === null) return
    const cell = cells[selected]
    if (cell.isGiven) return

    // Block if digit is already complete (9 instances on board)
    const digitCount = cells.filter((c) => c.value === digit).length
    if (digitCount >= 9) return

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

    // Validate against solution (immediate error) or fall back to peer-conflict detection
    const withConflicts = recomputeErrors(updated, solution)
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

    // Flash completed row or box (NOT digit — too noisy)
    const completed = getCompletedCells(withConflicts, selected)
    if (completed.length > 0) {
      set({ flashingCells: completed })
      setTimeout(() => set({ flashingCells: null }), FLASH_DURATION_MS)
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
    const { cells, selected, status, locked, solution } = get()
    if (status !== 'playing' || locked || selected === null) return
    const cell = cells[selected]
    if (cell.isGiven) return
    // Block erase if this digit is complete (all 9 placed) — but allow erasing errors
    if (cell.value !== null && !cell.isError && cells.filter((c) => c.value === cell.value).length >= 9) return

    const cleared = cells.map((c, i) =>
      i === selected ? { ...c, value: null, pencilMarks: [], isError: false } : c,
    )
    set({ cells: recomputeErrors(cleared, solution) })
  },

  useHint: (index: number, digit: number) => {
    const { cells, status, locked, hintsUsed, solution } = get()
    if (status !== 'playing' || locked) return
    const cell = cells[index]
    if (!cell || cell.isGiven || cell.value !== null) return

    // Colocar el dígito como si fuera una celda dada (marcada en azul, inmodificable)
    let updated = cells.map((c, i) =>
      i === index ? { ...c, value: digit, isGiven: true, pencilMarks: [], isError: false } : c,
    )
    // Limpiar marcas de lápiz en celdas vecinas
    updated = updated.map((c, i) => {
      if (i === index || !isPeer(i, index)) return c
      if (c.pencilMarks.includes(digit)) {
        return { ...c, pencilMarks: c.pencilMarks.filter((m) => m !== digit) }
      }
      return c
    })
    // Recompute errors — placing a hint may resolve previous user errors
    const withConflicts = recomputeErrors(updated, solution)
    set({ cells: withConflicts, hintsUsed: hintsUsed + 1, selected: index })

    const allFilled = withConflicts.every((c) => c.value !== null)
    const hasAnyConflict = withConflicts.some((c) => c.isError)
    if (allFilled && !hasAnyConflict) get().setComplete()
  },

  setPaused: (paused) => {
    set({ status: paused ? 'paused' : 'playing', locked: paused })
  },

  setComplete: () => {
    set({ status: 'complete', locked: true })

    // Fire-and-forget: save completion in the background
    const { cells, hintsUsed, errors, sessionToken } = get()
    const elapsed = useTimerStore.getState().elapsed
    const board = cells.map((c) => c.value ?? 0).join('')

    console.log('[sudoku] saving completion…', {
      hasToken: !!sessionToken,
      boardLength: board.length,
      boardPreview: board.slice(0, 20) + '…',
      elapsed,
      hintsUsed,
      errors,
    })

    fetch('/api/puzzle/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        sessionToken,
        board,
        elapsedSeconds: elapsed,
        hintsUsed,
        errorsMade: errors,
      }),
    })
      .then(async (r) => {
        const body = await r.json().catch(() => ({}))
        if (r.ok) {
          console.log('[sudoku] save OK:', body)
        } else {
          console.error('[sudoku] save FAILED:', r.status, body)
        }
      })
      .catch((e) => console.error('[sudoku] save network error:', e))
  },
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
    givens: null,
    solution: null,
    isDaily: false,
    flashingCells: null,
    locked: false,
  }),
  }),
  {
    name: 'sudoku-game',
    partialize: (state) => ({
      cells: state.cells,
      selected: state.selected,
      pencilMode: state.pencilMode,
      errors: state.errors,
      hintsUsed: state.hintsUsed,
      status: state.status,
      puzzleId: state.puzzleId,
      sessionToken: state.sessionToken,
      difficulty: state.difficulty,
      givens: state.givens,
      solution: state.solution,
      isDaily: state.isDaily,
    }),
  }
  )
)
