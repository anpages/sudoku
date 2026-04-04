import type { VercelRequest, VercelResponse } from '@vercel/node'
import { requireAuth, errorResponse } from '../lib/middleware.js'
import { db } from '../lib/db.js'
import { completions, dailyPuzzles } from '../../drizzle/schema.js'
import { eq, asc } from 'drizzle-orm'
import { getPseudonym } from '../lib/pseudonym.js'

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
      adjustedTime: completions.adjustedTime,
      elapsedSeconds: completions.elapsedSeconds,
      hintsUsed: completions.hintsUsed,
      errorsMade: completions.errorsMade,
      completedAt: completions.completedAt,
    })
    .from(completions)
    .where(eq(completions.dailyPuzzleId, daily.id))
    .orderBy(asc(completions.adjustedTime))
    .limit(100)

  const ranked = rows.map((r, i) => ({ ...r, name: getPseudonym(r.userId), rank: i + 1 }))
  res.setHeader('Cache-Control', 'public, max-age=5, stale-while-revalidate=10')
  res.status(200).json(ranked)
}
