import { motion } from 'framer-motion'
import { useGameStore } from '@/store/game-store'
import { useTimerStore } from '@/store/timer-store'

interface Props {
  onHint: () => void
  onRestart: () => void
}

export function ActionBar({ onHint, onRestart }: Props) {
  const pencilMode = useGameStore((s) => s.pencilMode)
  const status = useGameStore((s) => s.status)
  const locked = useGameStore((s) => s.locked)
  const eraseCell = useGameStore((s) => s.eraseCell)
  const setPaused = useGameStore((s) => s.setPaused)
  const pauseTimer = useTimerStore((s) => s.pause)

  const disabled = status !== 'playing' || locked

  function handlePause() {
    setPaused(true)
    pauseTimer()
  }

  const actions = [
    {
      key: 'erase',
      active: false,
      title: 'Borrar',
      icon: (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6}>
          <path d="M20 5H9l-7 7 7 7h11a2 2 0 002-2V7a2 2 0 00-2-2z" />
          <line x1="18" y1="9" x2="12" y2="15" />
          <line x1="12" y1="9" x2="18" y2="15" />
        </svg>
      ),
      onClick: () => eraseCell(),
    },
    {
      key: 'pencil',
      active: pencilMode,
      title: 'Notas',
      icon: (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6}>
          <path d="M12 20h9" />
          <path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
        </svg>
      ),
      onClick: () => useGameStore.setState((s) => ({ pencilMode: !s.pencilMode })),
    },
    {
      key: 'hint',
      active: false,
      title: 'Pista',
      icon: (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6}>
          <path d="M9 18h6" />
          <path d="M10 22h4" />
          <path d="M12 2a7 7 0 00-4 12.7V17h8v-2.3A7 7 0 0012 2z" />
        </svg>
      ),
      onClick: onHint,
    },
    {
      key: 'pause',
      active: false,
      title: 'Pausa',
      icon: (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6}>
          <rect x="6" y="4" width="4" height="16" rx="1" />
          <rect x="14" y="4" width="4" height="16" rx="1" />
        </svg>
      ),
      onClick: handlePause,
    },
    {
      key: 'restart',
      active: false,
      title: 'Reiniciar',
      icon: (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6}>
          <polyline points="1 4 1 10 7 10" />
          <path d="M3.51 15a9 9 0 102.13-9.36L1 10" />
        </svg>
      ),
      onClick: onRestart,
    },
  ]

  return (
    <div className="flex justify-center gap-2 w-full">
      {actions.map(({ key, active, title, icon, onClick }) => (
        <motion.button
          key={key}
          onClick={() => !disabled && onClick()}
          disabled={disabled}
          whileTap={!disabled ? { scale: 0.9 } : undefined}
          className={[
            'flex items-center justify-center rounded-xl transition-colors',
            'w-12 h-12 lg:w-14 lg:h-14',
            active
              ? 'text-(--color-primary) bg-(--color-cell-highlight)'
              : disabled
                ? 'text-(--color-text-muted) opacity-30'
                : 'text-(--color-text-muted) hover:text-(--color-text) hover:bg-(--color-surface-alt)',
          ].join(' ')}
          title={title}
        >
          {icon}
        </motion.button>
      ))}
    </div>
  )
}
