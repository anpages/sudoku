import type { VercelRequest, VercelResponse } from '@vercel/node'
import { requireAuth, errorResponse } from '../lib/middleware.js'
import { verifySessionToken, validateElapsedTime } from '../lib/anti-cheat.js'
import { db } from '../lib/db.js'
import { puzzles, puzzleSessions, completions, weeklyRankings } from '../../drizzle/schema.js'
import { eq, and, asc, sql } from 'drizzle-orm'

const HINT_PENALTY = 30
const ERROR_PENALTY = 15
function calculateAdjustedTime(elapsed: number, hints: number, errors: number) {
  return elapsed + hints * HINT_PENALTY + errors * ERROR_PENALTY
}

function getWeekStart(date: Date): string {
  const d = new Date(date)
  const day = d.getUTCDay()
  const diff = (day + 6) % 7 // Monday = 0
  d.setUTCDate(d.getUTCDate() - diff)
  return d.toISOString().slice(0, 10)
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    return await handleValidate(req, res)
  } catch (e) {
    console.error('[validate] Unhandled error:', e)
    res.status(500).json({ error: 'Internal error', detail: e instanceof Error ? e.message : String(e) })
  }
}

async function handleValidate(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return errorResponse(res, 'Método no permitido', 405)

  const session = await requireAuth(req, res)
  if (!session) return

  const { sessionToken, board, elapsedSeconds, hintsUsed, errorsMade } = req.body as {
    sessionToken?: string
    board?: string
    elapsedSeconds?: number
    hintsUsed?: number
    errorsMade?: number
  }

  if (!sessionToken || !board || typeof elapsedSeconds !== 'number') {
    return errorResponse(res, 'Datos incompletos')
  }

  if (board.length !== 81 || !/^\d{81}$/.test(board)) {
    return errorResponse(res, 'Tablero inválido')
  }

  // Verify HMAC session token
  const payload = verifySessionToken(sessionToken)
  if (!payload) return errorResponse(res, 'Token de sesión inválido', 401)

  // Ensure the session belongs to this user
  if (payload.userId !== session.user.id) {
    return errorResponse(res, 'No autorizado', 403)
  }

  // Fetch the puzzle session from DB (don't filter by status — the session may have
  // been marked 'abandoned' by generate.ts before this request arrives)
  const [psRow] = await db
    .select()
    .from(puzzleSessions)
    .where(
      and(
        eq(puzzleSessions.sessionToken, sessionToken),
        eq(puzzleSessions.userId, session.user.id),
      ),
    )
    .limit(1)

  if (!psRow) return errorResponse(res, 'Sesión no encontrada', 404)

  // Already completed — return existing result
  if (psRow.status === 'completed') {
    const [existing] = await db
      .select({ adjustedTime: completions.adjustedTime })
      .from(completions)
      .where(and(eq(completions.userId, session.user.id), eq(completions.puzzleId, payload.puzzleId)))
      .limit(1)
    const rank = await getDailyRank(psRow.dailyPuzzleId, session.user.id)
    return res.status(200).json({ adjustedTime: existing?.adjustedTime ?? 0, rank, dailyRank: rank })
  }

  // Validate elapsed time (anti-cheat)
  const { trusted } = validateElapsedTime(elapsedSeconds, payload.startedAt)

  // Fetch solution (NEVER sent to client — only used here for comparison)
  const [puzzleRow] = await db
    .select({ solution: puzzles.solution })
    .from(puzzles)
    .where(eq(puzzles.id, payload.puzzleId))
    .limit(1)

  if (!puzzleRow) return errorResponse(res, 'Puzzle no encontrado', 404)

  // Server-side validation: compare submitted board to stored solution
  if (board !== puzzleRow.solution) {
    return errorResponse(res, 'Tablero incorrecto', 422)
  }

  const hints = Math.max(0, Math.min(81, hintsUsed ?? 0))
  const errors = Math.max(0, Math.min(3, errorsMade ?? 0))
  const adjustedTime = calculateAdjustedTime(trusted, hints, errors)

  // Mark session as completed
  await db
    .update(puzzleSessions)
    .set({ status: 'completed', hintsUsed: hints, errorsMade: errors })
    .where(eq(puzzleSessions.sessionToken, sessionToken))

  // Upsert completion: only keep if better (lower adjustedTime)
  const [existing] = await db
    .select({ id: completions.id, adjustedTime: completions.adjustedTime })
    .from(completions)
    .where(
      and(eq(completions.userId, session.user.id), eq(completions.puzzleId, payload.puzzleId)),
    )
    .limit(1)

  if (existing && existing.adjustedTime <= adjustedTime) {
    // Existing record is better — return it but don't overwrite
    const rank = await getDailyRank(psRow.dailyPuzzleId, session.user.id)
    return res.status(200).json({ adjustedTime: existing.adjustedTime, rank, dailyRank: rank })
  }

  if (existing) {
    await db
      .update(completions)
      .set({ elapsedSeconds: trusted, errorsMade: errors, hintsUsed: hints, adjustedTime, completedAt: new Date() })
      .where(eq(completions.id, existing.id))
  } else {
    await db.insert(completions).values({
      userId: session.user.id,
      puzzleId: payload.puzzleId,
      dailyPuzzleId: psRow.dailyPuzzleId,
      sessionToken,
      elapsedSeconds: trusted,
      errorsMade: errors,
      hintsUsed: hints,
      adjustedTime,
      difficulty: psRow.dailyPuzzleId ? 'daily' : (await db.select({ difficulty: puzzles.difficulty }).from(puzzles).where(eq(puzzles.id, payload.puzzleId)).limit(1))[0]?.difficulty ?? 'facil',
      completedAt: new Date(),
    })
  }

  // Update weekly rankings
  const weekStart = getWeekStart(new Date())
  await db
    .insert(weeklyRankings)
    .values({ userId: session.user.id, weekStart, totalAdjustedTime: adjustedTime, gamesPlayed: 1 })
    .onConflictDoUpdate({
      target: [weeklyRankings.userId, weeklyRankings.weekStart],
      set: {
        totalAdjustedTime: sql`${weeklyRankings.totalAdjustedTime} + ${adjustedTime}`,
        gamesPlayed: sql`${weeklyRankings.gamesPlayed} + 1`,
        updatedAt: new Date(),
      },
    })

  const rank = await getDailyRank(psRow.dailyPuzzleId, session.user.id)
  res.status(200).json({ adjustedTime, rank, dailyRank: rank })
}

async function getDailyRank(dailyPuzzleId: string | null, userId: string): Promise<number | null> {
  if (!dailyPuzzleId) return null
  const rows = await db
    .select({ userId: completions.userId })
    .from(completions)
    .where(eq(completions.dailyPuzzleId, dailyPuzzleId))
    .orderBy(asc(completions.adjustedTime))
  const idx = rows.findIndex((r) => r.userId === userId)
  return idx === -1 ? null : idx + 1
}
