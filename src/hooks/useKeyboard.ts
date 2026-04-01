import { useEffect } from 'react'
import { useGameStore } from '@/store/game-store'

export function useKeyboard(_solution: string | null) {
  const { enterValue, eraseCell, selectCell, selected, status, locked } = useGameStore()

  useEffect(() => {
    if (status !== 'playing' || locked) return

    function handleKey(e: KeyboardEvent) {
      if (e.ctrlKey || e.metaKey || e.altKey) return

      if (e.key >= '1' && e.key <= '9') {
        e.preventDefault()
        enterValue(parseInt(e.key, 10))
        return
      }

      if (e.key === 'Delete' || e.key === 'Backspace' || e.key === '0') {
        e.preventDefault()
        eraseCell()
        return
      }

      if (e.key === 'p' || e.key === 'P') {
        e.preventDefault()
        useGameStore.setState((s) => ({ pencilMode: !s.pencilMode }))
        return
      }

      if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) return
      e.preventDefault()
      const cur = selected ?? 0
      const row = Math.floor(cur / 9)
      const col = cur % 9
      let next = cur
      if (e.key === 'ArrowUp') next = row > 0 ? cur - 9 : cur
      if (e.key === 'ArrowDown') next = row < 8 ? cur + 9 : cur
      if (e.key === 'ArrowLeft') next = col > 0 ? cur - 1 : cur
      if (e.key === 'ArrowRight') next = col < 8 ? cur + 1 : cur
      selectCell(next)
    }

    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [status, locked, selected, enterValue, eraseCell, selectCell])
}
