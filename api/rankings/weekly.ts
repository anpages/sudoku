import type { VercelRequest, VercelResponse } from '@vercel/node'
import { requireAuth, errorResponse } from '../lib/middleware'
import { db } from '../lib/db'
import { weeklyRankings, users } from '../../drizzle/schema'
import { eq, asc } from 'drizzle-orm'

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

  const weekStart = getWeekStart()

  const rows = await db
    .select({
      userId: weeklyRankings.userId,
      name: users.name,
      avatarUrl: users.image,
      totalAdjustedTime: weeklyRankings.totalAdjustedTime,
      gamesPlayed: weeklyRankings.gamesPlayed,
    })
    .from(weeklyRankings)
    .innerJoin(users, eq(weeklyRankings.userId, users.id))
    .where(eq(weeklyRankings.weekStart, weekStart))
    .orderBy(asc(weeklyRankings.totalAdjustedTime))
    .limit(100)

  const ranked = rows.map((r, i) => ({ ...r, rank: i + 1 }))
  res.setHeader('Cache-Control', 'public, max-age=60, stale-while-revalidate=120')
  res.status(200).json(ranked)
}
