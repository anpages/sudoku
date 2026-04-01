import type { VercelRequest, VercelResponse } from '@vercel/node'
import { requireAuth, errorResponse } from '../lib/middleware.js'
import { db } from '../lib/db.js'
import { completions, dailyPuzzles, users } from '../../drizzle/schema.js'
import { eq, asc } from 'drizzle-orm'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return errorResponse(res, 'Método no permitido', 405)

  const session = await requireAuth(req, res)
  if (!session) return

  const today = new Date().toISOString().slice(0, 10)

  const [daily] = await db
    .select({ id: dailyPuzzles.id })
    .from(dailyPuzzles)
    .where(eq(dailyPuzzles.date, today))
    .limit(1)

  if (!daily) return res.status(200).json([])

  const rows = await db
    .select({
      userId: completions.userId,
      name: users.name,
      avatarUrl: users.image,
      adjustedTime: completions.adjustedTime,
      elapsedSeconds: completions.elapsedSeconds,
      hintsUsed: completions.hintsUsed,
      errorsMade: completions.errorsMade,
      completedAt: completions.completedAt,
    })
    .from(completions)
    .innerJoin(users, eq(completions.userId, users.id))
    .where(eq(completions.dailyPuzzleId, daily.id))
    .orderBy(asc(completions.adjustedTime))
    .limit(100)

  const ranked = rows.map((r, i) => ({ ...r, rank: i + 1 }))
  res.setHeader('Cache-Control', 'public, max-age=30, stale-while-revalidate=60')
  res.status(200).json(ranked)
}
