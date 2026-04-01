import { createHmac } from 'crypto'

const SECRET = process.env.PUZZLE_HMAC_SECRET!

export interface SessionPayload {
  puzzleId: string
  userId: string
  startedAt: number
}

export function signSessionToken(payload: SessionPayload): string {
  const data = `${payload.puzzleId}:${payload.userId}:${payload.startedAt}`
  const sig = createHmac('sha256', SECRET).update(data).digest('hex')
  const encoded = Buffer.from(JSON.stringify(payload)).toString('base64url')
  return `${encoded}.${sig}`
}

export function verifySessionToken(token: string): SessionPayload | null {
  try {
    const [encodedPayload, sig] = token.split('.')
    if (!encodedPayload || !sig) return null
    const payload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString()) as SessionPayload
    const expected = createHmac('sha256', SECRET)
      .update(`${payload.puzzleId}:${payload.userId}:${payload.startedAt}`)
      .digest('hex')
    // Constant-time comparison
    if (sig.length !== expected.length) return null
    let diff = 0
    for (let i = 0; i < sig.length; i++) {
      diff |= sig.charCodeAt(i) ^ expected.charCodeAt(i)
    }
    return diff === 0 ? payload : null
  } catch {
    return null
  }
}

/**
 * Validates client-reported elapsed time against server-computed elapsed.
 * Returns the trusted elapsed in seconds, or null if tampering detected.
 */
export function validateElapsedTime(
  clientElapsed: number,
  startedAt: number,
): { trusted: number; suspicious: boolean } {
  const serverElapsed = Math.floor((Date.now() - startedAt) / 1000)
  const SLACK = 0.85

  if (clientElapsed < serverElapsed * SLACK) {
    // Client is running significantly faster than wall clock — suspicious
    return { trusted: serverElapsed, suspicious: true }
  }

  // If client reports more time than server (e.g. was paused), trust client up to 2× server
  const trusted = Math.min(clientElapsed, serverElapsed * 2)
  return { trusted, suspicious: false }
}
