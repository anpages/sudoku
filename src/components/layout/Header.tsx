import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
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
  const [menuOpen, setMenuOpen] = useState(false)

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

        {/* Right: nav + theme + avatar */}
        <div className="flex items-center gap-1">
          <Link
            to="/ranking"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-(--color-text-muted) hover:text-(--color-text) hover:bg-(--color-surface-alt) transition-colors"
          >
            Rankings
          </Link>

          <ThemeToggle />

          {user && (
            <div className="relative ml-1">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center rounded-full hover:opacity-80 transition-opacity"
              >
                {user.image ? (
                  <img src={user.image} alt={user.name ?? ''} className="w-8 h-8 rounded-full object-cover ring-2 ring-(--color-border)" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-(--color-primary) flex items-center justify-center text-white text-sm font-bold">
                    {(user.name ?? 'U')[0].toUpperCase()}
                  </div>
                )}
              </button>

              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                  <div className="absolute right-0 mt-2 w-48 bg-(--color-surface) border border-(--color-border) rounded-xl shadow-xl overflow-hidden z-50">
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
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
