import type { Difficulty } from './types'

export const MAX_ERRORS = 3

export const HINT_TIME_PENALTY = 30   // seconds added per hint
export const ERROR_TIME_PENALTY = 15  // seconds added per error

export const DIFFICULTY_CONFIG: Record<Difficulty, {
  label: string
  holes: [number, number]  // [min, max] cells removed
  color: string
}> = {
  facil:    { label: 'Fácil',   holes: [36, 40], color: '#22c55e' },
  medio:    { label: 'Medio',   holes: [41, 46], color: '#3b82f6' },
  dificil:  { label: 'Difícil', holes: [47, 51], color: '#f59e0b' },
  experto:  { label: 'Experto', holes: [52, 55], color: '#f97316' },
  maestro:  { label: 'Maestro', holes: [56, 59], color: '#ef4444' },
  extremo:  { label: 'Extremo', holes: [60, 62], color: '#8b5cf6' },
}

export const FLASH_DURATION_MS = 800
export const SYNC_INTERVAL_MS = 60_000
export const TIMER_SLACK = 0.85   // accept client time if >= 85% of server time
