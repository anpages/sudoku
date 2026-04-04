import type { VercelRequest, VercelResponse } from '@vercel/node'
import { requireAuth, errorResponse } from '../lib/middleware.js'
import { db } from '../lib/db.js'
import { completions } from '../../drizzle/schema.js'
import { eq, desc } from 'drizzle-orm'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return errorResponse(res, 'Método no permitido', 405)

  const session = await requireAuth(req, res)
  if (!session) return

  const rows = await db
    .select({
      difficulty: completions.difficulty,
      elapsedSeconds: completions.elapsedSeconds,
      adjustedTime: completions.adjustedTime,
      hintsUsed: completions.hintsUsed,
      errorsMade: completions.errorsMade,
      autoPencilUsed: completions.autoPencilUsed,
      completedAt: completions.completedAt,
      isDaily: completions.dailyPuzzleId,
    })
    .from(completions)
    .where(eq(completions.userId, session.user.id))
    .orderBy(desc(completions.completedAt))
    .limit(5)

  const result = rows.map((r) => ({
    ...r,
    isDaily: r.isDaily !== null,
    completedAt: r.completedAt.toISOString(),
  }))

  res.setHeader('Cache-Control', 'private, max-age=30')
  res.status(200).json(result)
}
