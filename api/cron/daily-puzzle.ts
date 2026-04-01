import type { VercelRequest, VercelResponse } from '@vercel/node'
import { generatePuzzle } from '../lib/puzzle-generator.js'
import { db } from '../lib/db.js'
import { puzzles, dailyPuzzles } from '../../drizzle/schema.js'
import { eq } from 'drizzle-orm'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Vercel cron sends Authorization header with CRON_SECRET
  const authHeader = req.headers['authorization']
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'No autorizado' })
  }

  // Generate for tomorrow (UTC)
  const tomorrow = new Date()
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1)
  const dateStr = tomorrow.toISOString().slice(0, 10)

  // Idempotent: skip if already exists
  const [existing] = await db
    .select({ id: dailyPuzzles.id })
    .from(dailyPuzzles)
    .where(eq(dailyPuzzles.date, dateStr))
    .limit(1)

  if (existing) {
    return res.status(200).json({ ok: true, skipped: true, date: dateStr })
  }

  // Generate a hard/expert puzzle for the daily
  const difficulties = ['dificil', 'experto'] as const
  const difficulty = difficulties[Math.floor(Math.random() * difficulties.length)]
  const { givens, solution } = generatePuzzle(difficulty)

  const [puzzle] = await db
    .insert(puzzles)
    .values({ difficulty, givens, solution })
    .returning({ id: puzzles.id })

  await db.insert(dailyPuzzles).values({
    puzzleId: puzzle.id,
    date: dateStr,
    difficulty,
  })

  res.status(200).json({ ok: true, date: dateStr, difficulty })
}
