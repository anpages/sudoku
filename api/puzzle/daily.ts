import type { VercelRequest, VercelResponse } from '@vercel/node'
import { requireAuth, errorResponse } from '../lib/middleware.js'
import { db } from '../lib/db.js'
import { dailyPuzzles, puzzles, completions } from '../../drizzle/schema.js'
import { eq, and, asc } from 'drizzle-orm'
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

  // Check if this user already completed today's puzzle
  const [myComp] = await db
    .select({
      adjustedTime: completions.adjustedTime,
      elapsedSeconds: completions.elapsedSeconds,
      hintsUsed: completions.hintsUsed,
      errorsMade: completions.errorsMade,
    })
    .from(completions)
    .where(and(
      eq(completions.userId, session.user.id),
      eq(completions.dailyPuzzleId, daily.id),
    ))
    .limit(1)

  let myRank: number | null = null
  if (myComp) {
    const allRows = await db
      .select({ userId: completions.userId })
      .from(completions)
      .where(eq(completions.dailyPuzzleId, daily.id))
      .orderBy(asc(completions.adjustedTime))
    const idx = allRows.findIndex((r) => r.userId === session.user.id)
    myRank = idx === -1 ? null : idx + 1
  }

  // Response is personalized — do not cache publicly
  res.setHeader('Cache-Control', 'private, no-store')
  res.status(200).json({
    ...daily,
    myCompletion: myComp ? { ...myComp, rank: myRank } : null,
  })
}
