import type { VercelRequest, VercelResponse } from '@vercel/node'
import { requireAuth, errorResponse } from '../lib/middleware.js'
import { db } from '../lib/db.js'
import { dailyPuzzles, puzzles } from '../../drizzle/schema.js'
import { eq } from 'drizzle-orm'
import { generatePuzzle } from '../lib/puzzle-generator.js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return errorResponse(res, 'Método no permitido', 405)

  const session = await requireAuth(req, res)
  if (!session) return

  const today = new Date().toISOString().slice(0, 10)

  let [daily] = await db
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

  // Auto-generate if none exists for today (first day, or cron missed)
  if (!daily) {
    const difficulties = ['dificil', 'experto'] as const
    const difficulty = difficulties[Math.floor(Math.random() * difficulties.length)]
    const { givens, solution } = generatePuzzle(difficulty)

    const [puzzle] = await db
      .insert(puzzles)
      .values({ difficulty, givens, solution })
      .returning({ id: puzzles.id })

    const [inserted] = await db
      .insert(dailyPuzzles)
      .values({ puzzleId: puzzle.id, date: today, difficulty })
      .returning({ id: dailyPuzzles.id })

    daily = {
      id: inserted.id,
      puzzleId: puzzle.id,
      date: today,
      difficulty,
      givens,
    }
  }

  res.setHeader('Cache-Control', 'public, max-age=60, stale-while-revalidate=300')
  res.status(200).json(daily)
}
