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
      label: 'Borrar',
      active: false,
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
          <path d="M20 5H9l-7 7 7 7h11a2 2 0 002-2V7a2 2 0 00-2-2z" />
          <line x1="18" y1="9" x2="12" y2="15" />
          <line x1="12" y1="9" x2="18" y2="15" />
        </svg>
      ),
      onClick: () => eraseCell(),
    },
    {
      key: 'pencil',
      label: 'Notas',
      active: pencilMode,
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
          <path d="M12 20h9" />
          <path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
        </svg>
      ),
      onClick: () => useGameStore.setState((s) => ({ pencilMode: !s.pencilMode })),
    },
    {
      key: 'hint',
      label: 'Pista',
      active: false,
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
          <path d="M9 18h6" />
          <path d="M10 22h4" />
          <path d="M12 2a7 7 0 00-4 12.7V17h8v-2.3A7 7 0 0012 2z" />
        </svg>
      ),
      onClick: onHint,
    },
    {
      key: 'pause',
      label: 'Pausa',
      active: false,
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
          <rect x="6" y="4" width="4" height="16" rx="1" />
          <rect x="14" y="4" width="4" height="16" rx="1" />
        </svg>
      ),
      onClick: handlePause,
    },
    {
      key: 'restart',
      label: 'Reiniciar',
      active: false,
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
          <polyline points="1 4 1 10 7 10" />
          <path d="M3.51 15a9 9 0 102.13-9.36L1 10" />
        </svg>
      ),
      onClick: onRestart,
    },
  ]

  return (
    <div className="flex justify-center gap-1 w-full">
      {actions.map(({ key, label, active, icon, onClick }) => (
        <motion.button
          key={key}
          onClick={() => !disabled && onClick()}
          disabled={disabled}
          whileTap={!disabled ? { scale: 0.9 } : undefined}
          className={[
            'flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors',
            'text-[11px] font-medium flex-1',
            active
              ? 'text-(--color-primary) bg-(--color-cell-highlight)'
              : disabled
                ? 'text-(--color-text-muted) opacity-30'
                : 'text-(--color-text-muted) hover:text-(--color-text) hover:bg-(--color-surface-alt)',
          ].join(' ')}
          title={label}
        >
          {icon}
          <span>{label}</span>
        </motion.button>
      ))}
    </div>
  )
}
