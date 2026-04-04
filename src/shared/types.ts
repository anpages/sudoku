export type Difficulty = 'facil' | 'medio' | 'dificil' | 'experto' | 'maestro' | 'extremo'

export interface Puzzle {
  id: string
  difficulty: Difficulty
  givens: string // 81-char string, '0' = empty
}

export interface PuzzleSession {
  puzzleId: string
  sessionToken: string
  givens: string
  solution: string
  difficulty: Difficulty
  startedAt: number // timestamp ms
}

export interface CellState {
  value: number | null     // 0-9, 0 = empty
  isGiven: boolean
  pencilMarks: number[]
  isError: boolean
}

export interface GameCompletion {
  puzzleId: string
  sessionToken: string
  board: string           // 81-char string submitted to server
  elapsedSeconds: number
  hintsUsed: number
  errorsMade: number
}

export interface CompletionResult {
  adjustedTime: number    // seconds (lower = better)
  rank: number | null
  dailyRank: number | null
}

export interface RankingEntry {
  rank: number
  userId: string
  name: string
  adjustedTime: number
  elapsedSeconds: number
  hintsUsed: number
  errorsMade: number
  autoPencilUsed: number
  completedAt: string
}

export interface WeeklyRankingEntry {
  rank: number
  userId: string
  name: string
  totalAdjustedTime: number
  gamesPlayed: number
}

export interface DailyCompletion {
  adjustedTime: number
  elapsedSeconds: number
  hintsUsed: number
  errorsMade: number
  rank: number | null
}

export interface DailyPuzzle {
  id: string          // daily_puzzle id
  puzzleId: string
  date: string        // YYYY-MM-DD
  difficulty: Difficulty
  givens: string
  solution: string
  myCompletion: DailyCompletion | null
}

export interface RecentGame {
  difficulty: string
  elapsedSeconds: number
  adjustedTime: number
  hintsUsed: number
  errorsMade: number
  autoPencilUsed: number
  completedAt: string
  isDaily: boolean
}

export interface UserProfile {
  id: string
  name: string
  pseudonym: string
  email: string
  avatarUrl: string | null
  createdAt: string
  gamesPlayed: number
  gamesAbandoned: number
  bestTimesByDifficulty: Partial<Record<Difficulty, number>>
  dailyStreak: number
}
