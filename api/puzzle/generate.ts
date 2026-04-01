import type { VercelRequest, VercelResponse } from '@vercel/node'
import { requireAuth, errorResponse } from '../lib/middleware'
import { generatePuzzle } from '../lib/puzzle-generator'
import { signSessionToken } from '../lib/anti-cheat'
import { db } from '../lib/db'
import { puzzles, puzzleSessions } from '../../drizzle/schema'
import type { Difficulty } from '../../src/shared/types'
import { DIFFICULTY_CONFIG } from '../../src/shared/constants'

const VALID_DIFFICULTIES = Object.keys(DIFFICULTY_CONFIG) as Difficulty[]

// Rate limiting: max 10 puzzle generations per user per minute
// Using a simple in-memory map (resets on cold start; good enough for serverless)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

function checkRateLimit(userId: string): boolean {
  const now = Date.now()
  const entry = rateLimitMap.get(userId)
  if (!entry || entry.resetAt < now) {
    rateLimitMap.set(userId, { count: 1, resetAt: now + 60_000 })
    return true
  }
  if (entry.count >= 10) return false
  entry.count++
  return true
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return errorResponse(res, 'Método no permitido', 405)

  const session = await requireAuth(req, res)
  if (!session) return

  const { difficulty } = req.body as { difficulty?: string }
  if (!difficulty || !VALID_DIFFICULTIES.includes(difficulty as Difficulty)) {
    return errorResponse(res, 'Dificultad inválida')
  }

  if (!checkRateLimit(session.user.id)) {
    return errorResponse(res, 'Demasiadas solicitudes. Espera un momento.', 429)
  }

  // Generate puzzle server-side
  const { givens, solution } = generatePuzzle(difficulty as Difficulty)

  // Store puzzle in DB
  const [puzzle] = await db.insert(puzzles).values({
    difficulty,
    givens,
    solution,   // NEVER returned to client
  }).returning({ id: puzzles.id })

  const startedAt = Date.now()
  const sessionToken = signSessionToken({
    puzzleId: puzzle.id,
    userId: session.user.id,
    startedAt,
  })

  // Create puzzle session
  await db.insert(puzzleSessions).values({
    userId: session.user.id,
    puzzleId: puzzle.id,
    sessionToken,
    startedAt: new Date(startedAt),
    status: 'active',
  })

  // Never return `solution`
  res.status(200).json({
    puzzleId: puzzle.id,
    sessionToken,
    givens,
    difficulty,
    startedAt,
  })
}
