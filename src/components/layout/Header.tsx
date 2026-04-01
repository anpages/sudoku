import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { ThemeToggle } from './ThemeToggle'
import { useAuth } from '@/hooks/useAuth'
import { signOut } from '@/lib/auth-client'

export function Header() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  async function handleSignOut() {
    await signOut()
    navigate('/login')
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b border-(--color-border) bg-(--color-surface)/95 backdrop-blur-sm">
      <div className="max-w-4xl mx-auto flex items-center justify-between px-4 h-14">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-xl font-black tracking-tight text-(--color-primary)">
            Sudoku
          </span>
        </Link>

        <nav className="hidden sm:flex items-center gap-6">
          <Link to="/diario" className="text-sm font-medium text-(--color-text-muted) hover:text-(--color-primary) transition-colors">
            Diario
          </Link>
          <Link to="/ranking" className="text-sm font-medium text-(--color-text-muted) hover:text-(--color-primary) transition-colors">
            Ranking
          </Link>
          <Link to="/torneo" className="text-sm font-medium text-(--color-text-muted) hover:text-(--color-primary) transition-colors">
            Torneos
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          {user && (
            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-2 rounded-full hover:bg-(--color-surface-alt) p-1 transition-colors"
              >
                {user.image ? (
                  <img
                    src={user.image}
                    alt={user.name ?? ''}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-(--color-primary) flex items-center justify-center text-white text-sm font-bold">
                    {(user.name ?? 'U')[0].toUpperCase()}
                  </div>
                )}
              </button>

              {menuOpen && (
                <div
                  className="absolute right-0 mt-2 w-48 bg-(--color-surface) border border-(--color-border) rounded-xl shadow-lg overflow-hidden z-50"
                  onBlur={() => setMenuOpen(false)}
                >
                  <div className="px-4 py-3 border-b border-(--color-border)">
                    <p className="text-sm font-semibold text-(--color-text) truncate">{user.name}</p>
                    <p className="text-xs text-(--color-text-muted) truncate">{user.email}</p>
                  </div>
                  <Link
                    to="/perfil"
                    onClick={() => setMenuOpen(false)}
                    className="block px-4 py-2.5 text-sm text-(--color-text) hover:bg-(--color-surface-alt) transition-colors"
                  >
                    Mi perfil
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-(--color-surface-alt) transition-colors"
                  >
                    Cerrar sesión
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
