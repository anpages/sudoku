import type { VercelRequest, VercelResponse } from '@vercel/node'
import { requireAuth, errorResponse } from '../lib/middleware.js'
import { db } from '../lib/db.js'
import { completions, weeklyRankings, puzzleSessions } from '../../drizzle/schema.js'
import { eq, and, gte, asc, sql } from 'drizzle-orm'

function getWeekStart(): string {
  const d = new Date()
  const day = d.getUTCDay()
  const diff = (day + 6) % 7
  d.setUTCDate(d.getUTCDate() - diff)
  return d.toISOString().slice(0, 10)
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return errorResponse(res, 'Método no permitido', 405)

  const session = await requireAuth(req, res)
  if (!session) return

  const userId = session.user.id
  const todayStart = new Date()
  todayStart.setUTCHours(0, 0, 0, 0)

  // Games completed today: count completed puzzle sessions started today
  const [todayCount] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(puzzleSessions)
    .where(
      and(
        eq(puzzleSessions.userId, userId),
        eq(puzzleSessions.status, 'completed'),
        gte(puzzleSessions.startedAt, todayStart),
      ),
    )

  // Weekly ranking position
  const weekStart = getWeekStart()
  const allWeekly = await db
    .select({ userId: weeklyRankings.userId, gamesPlayed: weeklyRankings.gamesPlayed })
    .from(weeklyRankings)
    .where(eq(weeklyRankings.weekStart, weekStart))
    .orderBy(asc(weeklyRankings.totalAdjustedTime))

  const weeklyIdx = allWeekly.findIndex((r) => r.userId === userId)
  const weeklyRank = weeklyIdx === -1 ? null : weeklyIdx + 1
  const weeklyGames = weeklyIdx === -1 ? 0 : allWeekly[weeklyIdx].gamesPlayed

  res.setHeader('Cache-Control', 'private, max-age=30')
  res.status(200).json({
    gamesToday: todayCount?.count ?? 0,
    weeklyRank,
    weeklyGames,
    weeklyTotal: allWeekly.length,
  })
}
