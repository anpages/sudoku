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
  const setPaused = useGameStore((s) => s.setPaused)
  const pauseTimer = useTimerStore((s) => s.pause)

  const disabled = status !== 'playing' || locked

  function handlePause() {
    setPaused(true)
    pauseTimer()
  }

  const actions = [
    {
      key: 'pencil',
      label: 'Lápiz',
      active: pencilMode,
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
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
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <circle cx="12" cy="12" r="10" />
          <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      ),
      onClick: onHint,
    },
    {
      key: 'restart',
      label: 'Reiniciar',
      active: false,
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <polyline points="1 4 1 10 7 10" />
          <path d="M3.51 15a9 9 0 102.13-9.36L1 10" />
        </svg>
      ),
      onClick: onRestart,
    },
    {
      key: 'pause',
      label: 'Pausa',
      active: false,
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <rect x="6" y="4" width="4" height="16" />
          <rect x="14" y="4" width="4" height="16" />
        </svg>
      ),
      onClick: handlePause,
    },
  ]

  return (
    <div className="flex justify-center gap-4 max-w-[min(90vw,480px)] mx-auto">
      {actions.map(({ key, label, active, icon, onClick }) => (
        <motion.button
          key={key}
          onClick={() => !disabled && onClick()}
          disabled={disabled}
          whileTap={!disabled ? { scale: 0.88 } : undefined}
          className={[
            'flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all',
            'text-xs font-medium',
            active
              ? 'text-(--color-primary) bg-(--color-cell-selected)'
              : disabled
                ? 'text-(--color-text-muted) opacity-40'
                : 'text-(--color-text-muted) hover:text-(--color-primary) hover:bg-(--color-surface-alt)',
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
