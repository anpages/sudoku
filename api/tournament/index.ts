import type { VercelRequest, VercelResponse } from '@vercel/node'
import { requireAuth, errorResponse } from '../lib/middleware.js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const session = await requireAuth(req, res)
  if (!session) return

  if (req.method === 'GET') {
    return res.status(200).json({ status: 'scaffold', tournaments: [] })
  }

  return errorResponse(res, 'Método no permitido', 405)
}
