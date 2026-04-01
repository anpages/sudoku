import type { VercelRequest, VercelResponse } from '@vercel/node'
import { requireAuth, errorResponse } from '../lib/middleware.js'
import { db } from '../lib/db.js'
import { completions, puzzleSessions } from '../../drizzle/schema.js'
import { eq, and, asc, sql } from 'drizzle-orm'
import type { Difficulty } from '../../src/shared/types.js'
import { DIFFICULTY_CONFIG } from '../../src/shared/constants.js'

function getConsecutiveDailyStreak(
  completedDates: string[],
): number {
  if (completedDates.length === 0) return 0
  const sorted = [...new Set(completedDates)].sort().reverse()
  const today = new Date().toISOString().slice(0, 10)
  let streak = 0
  let expected = today
  for (const d of sorted) {
    if (d === expected) {
      streak++
      const prev = new Date(expected)
      prev.setUTCDate(prev.getUTCDate() - 1)
      expected = prev.toISOString().slice(0, 10)
    } else {
      break
    }
  }
  return streak
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return errorResponse(res, 'Método no permitido', 405)

  const session = await requireAuth(req, res)
  if (!session) return

  const userId = session.user.id

  // All completions for this user
  const userCompletions = await db
    .select({
      adjustedTime: completions.adjustedTime,
      difficulty: completions.difficulty,
      dailyPuzzleId: completions.dailyPuzzleId,
      completedAt: completions.completedAt,
    })
    .from(completions)
    .where(eq(completions.userId, userId))
    .orderBy(asc(completions.adjustedTime))

  const gamesPlayed = userCompletions.length

  // Count abandoned sessions (started a new game while one was in progress)
  const [abandonedCount] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(puzzleSessions)
    .where(
      and(
        eq(puzzleSessions.userId, userId),
        eq(puzzleSessions.status, 'abandoned'),
      ),
    )

  const gamesAbandoned = abandonedCount?.count ?? 0

  // Best time per difficulty
  const bestTimesByDifficulty: Partial<Record<Difficulty, number>> = {}
  for (const diff of Object.keys(DIFFICULTY_CONFIG) as Difficulty[]) {
    const best = userCompletions
      .filter((c) => c.difficulty === diff)
      .sort((a, b) => a.adjustedTime - b.adjustedTime)[0]
    if (best) bestTimesByDifficulty[diff] = best.adjustedTime
  }

  // Daily streak: get dates of daily completions
  const dailyCompletionDates = userCompletions
    .filter((c) => c.dailyPuzzleId !== null)
    .map((c) => c.completedAt.toISOString().slice(0, 10))

  const dailyStreak = getConsecutiveDailyStreak(dailyCompletionDates)

  res.status(200).json({
    id: session.user.id,
    name: session.user.name,
    email: session.user.email,
    avatarUrl: session.user.image ?? null,
    createdAt: session.user.createdAt,
    gamesPlayed,
    gamesAbandoned,
    bestTimesByDifficulty,
    dailyStreak,
  })
}
