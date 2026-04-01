import type { VercelRequest, VercelResponse } from '@vercel/node'
import { requireAuth, errorResponse } from '../lib/middleware'
import { db } from '../lib/db'
import { dailyPuzzles, puzzles } from '../../drizzle/schema'
import { eq } from 'drizzle-orm'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return errorResponse(res, 'Método no permitido', 405)

  const session = await requireAuth(req, res)
  if (!session) return

  const today = new Date().toISOString().slice(0, 10)

  const [daily] = await db
    .select({
      id: dailyPuzzles.id,
      puzzleId: dailyPuzzles.puzzleId,
      date: dailyPuzzles.date,
      difficulty: dailyPuzzles.difficulty,
      givens: puzzles.givens,  // safe: no solution
    })
    .from(dailyPuzzles)
    .innerJoin(puzzles, eq(dailyPuzzles.puzzleId, puzzles.id))
    .where(eq(dailyPuzzles.date, today))
    .limit(1)

  if (!daily) {
    return errorResponse(res, 'Sin sudoku diario disponible hoy', 404)
  }

  res.setHeader('Cache-Control', 'public, max-age=60, stale-while-revalidate=300')
  res.status(200).json(daily)
}
