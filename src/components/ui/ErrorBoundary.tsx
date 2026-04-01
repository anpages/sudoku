import { Component } from 'react'
import type { ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  override render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback
      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 px-6 text-center">
          <div className="text-4xl">⚠️</div>
          <h2 className="text-lg font-bold text-(--color-text)">Algo salió mal</h2>
          <p className="text-sm text-(--color-text-muted) max-w-xs">
            {this.state.error?.message ?? 'Error inesperado'}
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="px-5 py-2.5 bg-(--color-primary) text-white rounded-xl text-sm font-semibold"
          >
            Intentar de nuevo
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
