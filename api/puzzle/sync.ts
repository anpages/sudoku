import type { VercelRequest, VercelResponse } from '@vercel/node'
import { requireAuth, errorResponse } from '../lib/middleware'
import { verifySessionToken } from '../lib/anti-cheat'
import { db } from '../lib/db'
import { puzzleSessions } from '../../drizzle/schema'
import { and, eq } from 'drizzle-orm'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return errorResponse(res, 'Método no permitido', 405)

  const session = await requireAuth(req, res)
  if (!session) return

  const { sessionToken, elapsed } = req.body as { sessionToken?: string; elapsed?: number }
  if (!sessionToken || typeof elapsed !== 'number') {
    return errorResponse(res, 'Datos incompletos')
  }

  const payload = verifySessionToken(sessionToken)
  if (!payload || payload.userId !== session.user.id) {
    return errorResponse(res, 'Token inválido', 401)
  }

  await db
    .update(puzzleSessions)
    .set({ lastSyncAt: new Date(), clientElapsed: elapsed })
    .where(
      and(
        eq(puzzleSessions.sessionToken, sessionToken),
        eq(puzzleSessions.status, 'active'),
      ),
    )

  res.status(200).json({ ok: true })
}
