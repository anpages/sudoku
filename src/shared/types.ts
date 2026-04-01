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
  avatarUrl: string | null
  adjustedTime: number
  elapsedSeconds: number
  hintsUsed: number
  errorsMade: number
  completedAt: string
}

export interface WeeklyRankingEntry {
  rank: number
  userId: string
  name: string
  avatarUrl: string | null
  totalAdjustedTime: number
  gamesPlayed: number
}

export interface DailyPuzzle {
  id: string          // daily_puzzle id
  puzzleId: string
  date: string        // YYYY-MM-DD
  difficulty: Difficulty
  givens: string
}

export interface UserProfile {
  id: string
  name: string
  email: string
  avatarUrl: string | null
  createdAt: string
  gamesPlayed: number
  gamesAbandoned: number
  bestTimesByDifficulty: Partial<Record<Difficulty, number>>
  dailyStreak: number
}
