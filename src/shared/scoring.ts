import { HINT_RANK_MULTIPLIER, AUTO_PENCIL_RANK_MULTIPLIER } from './constants'

export function calculateAdjustedTime(
  elapsedSeconds: number,
  hintsUsed: number,
  autoPencilUsed: number,
): number {
  const mult =
    Math.pow(HINT_RANK_MULTIPLIER, hintsUsed) *
    Math.pow(AUTO_PENCIL_RANK_MULTIPLIER, autoPencilUsed)
  return Math.round(elapsedSeconds * mult)
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
