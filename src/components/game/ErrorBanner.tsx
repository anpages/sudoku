import { MAX_ERRORS } from '@/shared/constants'

interface Props {
  errors: number
}

export function ErrorBanner({ errors }: Props) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-xs text-(--color-text-muted) mr-1">Errores:</span>
      {Array.from({ length: MAX_ERRORS }, (_, i) => (
        <span key={i} className={i < errors ? 'grayscale-0' : 'grayscale opacity-30'}>
          ❤️
        </span>
      ))}
    </div>
  )
}
