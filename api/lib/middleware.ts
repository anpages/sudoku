import type { VercelRequest, VercelResponse } from '@vercel/node'
import { auth } from './auth'

export async function requireAuth(req: VercelRequest, res: VercelResponse) {
  const session = await auth.api.getSession({
    headers: new Headers(req.headers as Record<string, string>),
  })
  if (!session?.user) {
    res.status(401).json({ error: 'No autenticado' })
    return null
  }
  return session
}

export function jsonResponse(res: VercelResponse, data: unknown, status = 200) {
  res.status(status).json(data)
}

export function errorResponse(res: VercelResponse, message: string, status = 400) {
  res.status(status).json({ error: message })
}
