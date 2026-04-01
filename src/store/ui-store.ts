import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type Theme = 'light' | 'dark'

interface Toast {
  id: string
  message: string
  type: 'success' | 'error' | 'info'
}

interface UIStore {
  theme: Theme
  toasts: Toast[]
  toggleTheme: () => void
  setTheme: (theme: Theme) => void
  addToast: (message: string, type?: Toast['type']) => void
  removeToast: (id: string) => void
}

function applyTheme(theme: Theme) {
  const root = document.documentElement
  if (theme === 'dark') {
    root.classList.add('dark')
  } else {
    root.classList.remove('dark')
  }
}

export const useUIStore = create<UIStore>()(
  persist(
    (set, get) => ({
      theme: 'light',
      toasts: [],

      toggleTheme: () => {
        const next = get().theme === 'light' ? 'dark' : 'light'
        applyTheme(next)
        set({ theme: next })
      },

      setTheme: (theme) => {
        applyTheme(theme)
        set({ theme })
      },

      addToast: (message, type = 'info') => {
        const id = crypto.randomUUID()
        set((s) => ({ toasts: [...s.toasts, { id, message, type }] }))
        setTimeout(() => get().removeToast(id), 3500)
      },

      removeToast: (id) => {
        set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }))
      },
    }),
    {
      name: 'sudoku-ui',
      partialize: (s) => ({ theme: s.theme }),
      onRehydrateStorage: () => (state) => {
        if (state) applyTheme(state.theme)
      },
    },
  ),
)
