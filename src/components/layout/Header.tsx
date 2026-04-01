import { Link, useNavigate } from 'react-router-dom'
import { ThemeToggle } from './ThemeToggle'
import { useAuth } from '@/hooks/useAuth'
import { signOut } from '@/lib/auth-client'

function GridIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 18 18" fill="currentColor" aria-hidden="true">
      <rect x="0"   y="0"   width="5" height="5" rx="1" />
      <rect x="6.5" y="0"   width="5" height="5" rx="1" />
      <rect x="13"  y="0"   width="5" height="5" rx="1" />
      <rect x="0"   y="6.5" width="5" height="5" rx="1" />
      <rect x="6.5" y="6.5" width="5" height="5" rx="1" />
      <rect x="13"  y="6.5" width="5" height="5" rx="1" />
      <rect x="0"   y="13"  width="5" height="5" rx="1" />
      <rect x="6.5" y="13"  width="5" height="5" rx="1" />
      <rect x="13"  y="13"  width="5" height="5" rx="1" />
    </svg>
  )
}

export function Header() {
  const { user } = useAuth()
  const navigate = useNavigate()

  async function handleSignOut() {
    await signOut()
    navigate('/login')
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b border-(--color-border) bg-(--color-surface)/95 backdrop-blur-sm">
      <div className="max-w-5xl mx-auto flex items-center justify-between px-4 h-14">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-7 h-7 rounded-lg bg-(--color-primary) flex items-center justify-center text-white transition-transform group-hover:scale-105">
            <GridIcon />
          </div>
          <span className="font-black text-lg tracking-tight text-(--color-text)">Sudoku</span>
        </Link>

        {/* Right: theme + perfil + salir */}
        <div className="flex items-center gap-1">
          <ThemeToggle />

          {user && (
            <>
              <Link
                to="/perfil"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-(--color-text-muted) hover:text-(--color-text) hover:bg-(--color-surface-alt) transition-colors"
              >
                Perfil
              </Link>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-red-500 hover:bg-(--color-surface-alt) transition-colors"
              >
                Salir
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
