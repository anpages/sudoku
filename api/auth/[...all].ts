import type { VercelRequest, VercelResponse } from '@vercel/node'
import { auth } from '../lib/auth'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // better-auth expects a Web-standard Request object
  const webReq = new Request(`${process.env.BETTER_AUTH_URL}${req.url}`, {
    method: req.method,
    headers: new Headers(req.headers as Record<string, string>),
    body: req.method !== 'GET' && req.method !== 'HEAD'
      ? JSON.stringify(req.body)
      : undefined,
  })
  const webRes = await auth.handler(webReq)
  res.status(webRes.status)
  webRes.headers.forEach((value, key) => res.setHeader(key, value))
  const body = await webRes.text()
  res.send(body)
}
