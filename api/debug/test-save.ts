import type { VercelRequest, VercelResponse } from '@vercel/node'
import { requireAuth, errorResponse } from '../lib/middleware.js'
import { generatePuzzle } from '../lib/puzzle-generator.js'
import { signSessionToken, verifySessionToken, validateElapsedTime } from '../lib/anti-cheat.js'
import { db } from '../lib/db.js'
import { puzzles, puzzleSessions, completions, weeklyRankings } from '../../drizzle/schema.js'
import { eq, and } from 'drizzle-orm'
import { calculateAdjustedTime } from '../../src/shared/scoring.js'
import { sql } from 'drizzle-orm'

/**
 * GET /api/debug/test-save
 *
 * Simulates the full save pipeline:
 * 1. Generate a puzzle
 * 2. Create a session
 * 3. Submit the solution to /validate logic
 * 4. Check if the completion was saved
 * 5. Clean up test data
 *
 * Returns a step-by-step log of what happened.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return errorResponse(res, 'GET only', 405)

  const session = await requireAuth(req, res)
  if (!session) return

  const log: string[] = []
  const userId = session.user.id

  try {
    // Step 1: Generate puzzle
    const { givens, solution } = generatePuzzle('facil')
    log.push(`1. Generated puzzle: givens=${givens.slice(0, 20)}… solution=${solution.slice(0, 20)}…`)

    // Step 2: Store puzzle
    const [puzzle] = await db.insert(puzzles).values({
      difficulty: 'facil',
      givens,
      solution,
    }).returning({ id: puzzles.id })
    log.push(`2. Puzzle stored: id=${puzzle.id}`)

    // Step 3: Create session
    const startedAt = Date.now() - 120_000 // pretend started 2 min ago
    const sessionToken = signSessionToken({ puzzleId: puzzle.id, userId, startedAt })
    log.push(`3. Session token created: ${sessionToken.slice(0, 30)}…`)

    await db.insert(puzzleSessions).values({
      userId,
      puzzleId: puzzle.id,
      sessionToken,
      startedAt: new Date(startedAt),
      status: 'active',
    })
    log.push('4. Puzzle session inserted (status=active)')

    // Step 4: Verify token works
    const payload = verifySessionToken(sessionToken)
    if (!payload) {
      log.push('5. ERROR: Token verification failed!')
      return res.status(200).json({ success: false, log })
    }
    log.push(`5. Token verified: puzzleId=${payload.puzzleId}, userId=${payload.userId}`)

    // Step 5: Validate board (simulating what validate.ts does)
    const board = solution // we're submitting the correct solution
    const elapsed = 120

    const [psRow] = await db.select().from(puzzleSessions)
      .where(and(eq(puzzleSessions.sessionToken, sessionToken), eq(puzzleSessions.userId, userId)))
      .limit(1)

    if (!psRow) {
      log.push('6. ERROR: Session not found in DB!')
      return res.status(200).json({ success: false, log })
    }
    log.push(`6. Session found in DB: status=${psRow.status}`)

    // Step 6: Compare board to solution
    const [puzzleRow] = await db.select({ solution: puzzles.solution })
      .from(puzzles).where(eq(puzzles.id, payload.puzzleId)).limit(1)

    if (!puzzleRow) {
      log.push('7. ERROR: Puzzle not found!')
      return res.status(200).json({ success: false, log })
    }

    const boardMatch = board === puzzleRow.solution
    log.push(`7. Board comparison: match=${boardMatch}`)

    if (!boardMatch) {
      log.push('   ERROR: Board does NOT match solution!')
      return res.status(200).json({ success: false, log })
    }

    // Step 7: Calculate adjusted time
    const { trusted } = validateElapsedTime(elapsed, payload.startedAt)
    const adjustedTime = calculateAdjustedTime(trusted, 0, 0)
    log.push(`8. Adjusted time: ${adjustedTime}s (trusted=${trusted}s)`)

    // Step 8: Mark session completed
    await db.update(puzzleSessions)
      .set({ status: 'completed', hintsUsed: 0, errorsMade: 0 })
      .where(eq(puzzleSessions.sessionToken, sessionToken))
    log.push('9. Session marked as completed')

    // Step 9: Insert completion
    await db.insert(completions).values({
      userId,
      puzzleId: payload.puzzleId,
      sessionToken,
      elapsedSeconds: trusted,
      errorsMade: 0,
      hintsUsed: 0,
      adjustedTime,
      difficulty: 'facil',
      completedAt: new Date(),
    })
    log.push('10. Completion inserted')

    // Step 10: Verify it was saved
    const [saved] = await db.select({ id: completions.id, adjustedTime: completions.adjustedTime })
      .from(completions)
      .where(and(eq(completions.userId, userId), eq(completions.puzzleId, payload.puzzleId)))
      .limit(1)

    if (!saved) {
      log.push('11. ERROR: Completion NOT found after insert!')
      return res.status(200).json({ success: false, log })
    }
    log.push(`11. Completion verified in DB: id=${saved.id}, adjustedTime=${saved.adjustedTime}`)

    // Step 11: Clean up test data
    await db.delete(completions).where(eq(completions.id, saved.id))
    await db.delete(puzzleSessions).where(eq(puzzleSessions.sessionToken, sessionToken))
    await db.delete(puzzles).where(eq(puzzles.id, puzzle.id))
    log.push('12. Test data cleaned up')

    res.status(200).json({ success: true, log })
  } catch (e) {
    log.push(`ERROR: ${e instanceof Error ? e.message : String(e)}`)
    res.status(200).json({ success: false, log })
  }
}
