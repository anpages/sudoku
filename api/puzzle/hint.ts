import type { VercelRequest, VercelResponse } from '@vercel/node'
import { requireAuth, errorResponse } from '../lib/middleware'
import { verifySessionToken } from '../lib/anti-cheat'
import { db } from '../lib/db'
import { puzzles, puzzleSessions } from '../../drizzle/schema'
import { and, eq } from 'drizzle-orm'

const MAX_HINTS = 5

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return errorResponse(res, 'Método no permitido', 405)

  const session = await requireAuth(req, res)
  if (!session) return

  const { sessionToken, currentBoard } = req.body as {
    sessionToken?: string
    currentBoard?: string  // 81-char string with current state ('0' = empty)
  }

  if (!sessionToken || !currentBoard || currentBoard.length !== 81) {
    return errorResponse(res, 'Datos incompletos')
  }

  const payload = verifySessionToken(sessionToken)
  if (!payload || payload.userId !== session.user.id) {
    return errorResponse(res, 'Token inválido', 401)
  }

  const [psRow] = await db
    .select()
    .from(puzzleSessions)
    .where(
      and(
        eq(puzzleSessions.sessionToken, sessionToken),
        eq(puzzleSessions.status, 'active'),
      ),
    )
    .limit(1)

  if (!psRow) return errorResponse(res, 'Sesión no encontrada', 404)
  if (psRow.hintsUsed >= MAX_HINTS) return errorResponse(res, 'Máximo de pistas alcanzado', 403)

  const [puzzleRow] = await db
    .select({ solution: puzzles.solution })
    .from(puzzles)
    .where(eq(puzzles.id, payload.puzzleId))
    .limit(1)

  if (!puzzleRow) return errorResponse(res, 'Puzzle no encontrado', 404)

  // Find an empty cell and return just that index + correct digit
  // We never return the full solution
  const emptyCells = Array.from(currentBoard).reduce<number[]>((acc, c, i) => {
    if (c === '0') acc.push(i)
    return acc
  }, [])

  if (emptyCells.length === 0) return errorResponse(res, 'No hay celdas vacías', 400)

  // Pick a random empty cell
  const idx = emptyCells[Math.floor(Math.random() * emptyCells.length)]
  const digit = parseInt(puzzleRow.solution[idx], 10)

  // Increment hints used
  await db
    .update(puzzleSessions)
    .set({ hintsUsed: psRow.hintsUsed + 1 })
    .where(eq(puzzleSessions.sessionToken, sessionToken))

  res.status(200).json({ index: idx, digit })
}
