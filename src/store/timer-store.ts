import { create } from 'zustand'
import { SYNC_INTERVAL_MS } from '@/shared/constants'

interface TimerStore {
  elapsed: number         // seconds
  running: boolean
  sessionToken: string | null

  start: (sessionToken: string, initialElapsed?: number) => void
  pause: () => void
  resume: () => void
  reset: () => void
  tick: () => void
}

let intervalId: ReturnType<typeof setInterval> | null = null
let syncIntervalId: ReturnType<typeof setInterval> | null = null

function clearIntervals() {
  if (intervalId) { clearInterval(intervalId); intervalId = null }
  if (syncIntervalId) { clearInterval(syncIntervalId); syncIntervalId = null }
}

async function syncElapsed(sessionToken: string, elapsed: number) {
  try {
    await fetch('/api/puzzle/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionToken, elapsed }),
    })
  } catch {
    // silent — sync is best-effort
  }
}

export const useTimerStore = create<TimerStore>()((set, get) => {
  function startIntervals(sessionToken: string) {
    clearIntervals()
    intervalId = setInterval(() => get().tick(), 1000)
    syncIntervalId = setInterval(() => {
      syncElapsed(sessionToken, get().elapsed)
    }, SYNC_INTERVAL_MS)
  }

  // Page Visibility API — pause when hidden
  if (typeof document !== 'undefined') {
    document.addEventListener('visibilitychange', () => {
      const { running, sessionToken: token } = get()
      if (document.hidden && running) {
        clearIntervals()
        set({ running: false })
      } else if (!document.hidden && !running && token) {
        set({ running: true })
        startIntervals(token)
      }
    })
  }

  return {
    elapsed: 0,
    running: false,
    sessionToken: null,

    start: (sessionToken, initialElapsed = 0) => {
      clearIntervals()
      set({ elapsed: initialElapsed, running: true, sessionToken })
      startIntervals(sessionToken)
    },

    pause: () => {
      clearIntervals()
      set({ running: false })
    },

    resume: () => {
      const { sessionToken } = get()
      if (!sessionToken) return
      set({ running: true })
      startIntervals(sessionToken)
    },

    reset: () => {
      clearIntervals()
      set({ elapsed: 0, running: false, sessionToken: null })
    },

    tick: () => set((s) => ({ elapsed: s.elapsed + 1 })),
  }
})
