import { HINT_TIME_PENALTY, ERROR_TIME_PENALTY } from './constants'

export function calculateAdjustedTime(
  elapsedSeconds: number,
  hintsUsed: number,
  errorsMade: number,
): number {
  return elapsedSeconds + hintsUsed * HINT_TIME_PENALTY + errorsMade * ERROR_TIME_PENALTY
}

export function formatTime(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  const s = totalSeconds % 60
  if (h > 0) {
    return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}
