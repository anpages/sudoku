import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import type { DailyPuzzle } from '@/shared/types'

interface UseDailyPuzzleResult {
  daily: DailyPuzzle | null
  loading: boolean
  error: string | null
}

export function useDailyPuzzle(): UseDailyPuzzleResult {
  const [daily, setDaily] = useState<DailyPuzzle | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    api.get<DailyPuzzle>('/api/puzzle/daily')
      .then(setDaily)
      .catch((e: unknown) => setError(e instanceof Error ? e.message : 'Error'))
      .finally(() => setLoading(false))
  }, [])

  return { daily, loading, error }
}
