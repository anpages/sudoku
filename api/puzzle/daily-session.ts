import type { VercelRequest, VercelResponse } from '@vercel/node'
import { requireAuth, errorResponse } from '../lib/middleware'
import { signSessionToken } from '../lib/anti-cheat'
import { db } from '../lib/db'
import { dailyPuzzles, puzzleSessions } from '../../drizzle/schema'
import { and, eq } from 'drizzle-orm'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return errorResponse(res, 'Método no permitido', 405)

  const session = await requireAuth(req, res)
  if (!session) return

  const { dailyPuzzleId } = req.body as { dailyPuzzleId?: string }
  if (!dailyPuzzleId) return errorResponse(res, 'dailyPuzzleId requerido')

  const [daily] = await db
    .select()
    .from(dailyPuzzles)
    .where(eq(dailyPuzzles.id, dailyPuzzleId))
    .limit(1)

  if (!daily) return errorResponse(res, 'Sudoku diario no encontrado', 404)

  // Abandon any previous active sessions for this daily puzzle
  await db
    .update(puzzleSessions)
    .set({ status: 'abandoned' })
    .where(
      and(
        eq(puzzleSessions.userId, session.user.id),
        eq(puzzleSessions.dailyPuzzleId, dailyPuzzleId),
        eq(puzzleSessions.status, 'active'),
      ),
    )

  const startedAt = Date.now()
  const sessionToken = signSessionToken({
    puzzleId: daily.puzzleId,
    userId: session.user.id,
    startedAt,
  })

  await db.insert(puzzleSessions).values({
    userId: session.user.id,
    puzzleId: daily.puzzleId,
    dailyPuzzleId,
    sessionToken,
    startedAt: new Date(startedAt),
    status: 'active',
  })

  res.status(200).json({ sessionToken })
}
