import type { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const checks: string[] = []

  try {
    // Test 1: Basic function works
    checks.push('1. Function running OK')

    // Test 2: Auth
    try {
      const { requireAuth } = await import('../lib/middleware.js')
      const session = await requireAuth(req, res)
      if (!session) {
        checks.push('2. Auth: NOT authenticated (need login)')
        return // requireAuth already sent 401
      }
      checks.push(`2. Auth OK: ${session.user.email}`)
    } catch (e) {
      checks.push(`2. Auth ERROR: ${e instanceof Error ? e.message : e}`)
      return res.status(200).json({ checks })
    }

    // Test 3: DB
    try {
      const { db } = await import('../lib/db.js')
      const result = await db.execute({ sql: 'SELECT 1 as test', params: [] } as any)
      checks.push('3. DB connection OK')
    } catch (e) {
      checks.push(`3. DB ERROR: ${e instanceof Error ? e.message : e}`)
      return res.status(200).json({ checks })
    }

    // Test 4: Schema imports
    try {
      const schema = await import('../../drizzle/schema.js')
      checks.push(`4. Schema OK: tables=[${Object.keys(schema).join(',')}]`)
    } catch (e) {
      checks.push(`4. Schema ERROR: ${e instanceof Error ? e.message : e}`)
      return res.status(200).json({ checks })
    }

    // Test 5: Anti-cheat
    try {
      const { signSessionToken, verifySessionToken } = await import('../lib/anti-cheat.js')
      const token = signSessionToken({ puzzleId: 'test', userId: 'test', startedAt: Date.now() })
      const payload = verifySessionToken(token)
      checks.push(`5. Anti-cheat OK: token=${token.slice(0, 20)}… verified=${!!payload}`)
    } catch (e) {
      checks.push(`5. Anti-cheat ERROR: ${e instanceof Error ? e.message : e}`)
      return res.status(200).json({ checks })
    }

    // Test 6: Scoring
    try {
      const { calculateAdjustedTime } = await import('../../src/shared/scoring.js')
      const time = calculateAdjustedTime(100, 2, 1)
      checks.push(`6. Scoring OK: calculateAdjustedTime(100,2,1)=${time}`)
    } catch (e) {
      checks.push(`6. Scoring ERROR: ${e instanceof Error ? e.message : e}`)
      return res.status(200).json({ checks })
    }

    // Test 7: Drizzle operators
    try {
      const { eq, and, asc, sql } = await import('drizzle-orm')
      checks.push(`7. Drizzle operators OK: eq=${typeof eq}, sql=${typeof sql}`)
    } catch (e) {
      checks.push(`7. Drizzle operators ERROR: ${e instanceof Error ? e.message : e}`)
      return res.status(200).json({ checks })
    }

    checks.push('ALL CHECKS PASSED')
    res.status(200).json({ checks })
  } catch (e) {
    checks.push(`FATAL: ${e instanceof Error ? e.message : e}`)
    res.status(200).json({ checks })
  }
}
