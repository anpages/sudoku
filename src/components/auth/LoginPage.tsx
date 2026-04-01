import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { signIn } from '@/lib/auth-client'
import { useAuth } from '@/hooks/useAuth'
import { ThemeToggle } from '@/components/layout/ThemeToggle'
import { DIFFICULTY_CONFIG } from '@/shared/constants'

const FEATURES = [
  { icon: '🎯', title: '6 niveles de dificultad', desc: 'Desde Fácil hasta Extremo' },
  { icon: '📅', title: 'Sudoku diario', desc: 'Comparte el reto con el mundo' },
  { icon: '🏆', title: 'Rankings', desc: 'Diario y semanal — gana el más rápido' },
  { icon: '✏️', title: 'Modo lápiz', desc: 'Anota tus posibilidades' },
  { icon: '📱', title: 'PWA instalable', desc: 'iOS, Android y Chromebook' },
  { icon: '🌙', title: 'Modo oscuro', desc: 'Juega cómodo de noche' },
]

// Decorative animated board — just a 9×9 grid with some colored cells
const HIGHLIGHT_CELLS = new Set([4, 13, 22, 30, 31, 32, 39, 40, 41, 48, 49, 50, 58, 67, 76])

export function LoginPage() {
  const navigate = useNavigate()
  const { isAuthenticated, isLoading } = useAuth()

  useEffect(() => {
    if (!isLoading && isAuthenticated) navigate('/', { replace: true })
  }, [isAuthenticated, isLoading, navigate])

  async function handleGoogleLogin() {
    await signIn.social({ provider: 'google', callbackURL: '/' })
  }

  return (
    <div className="min-h-screen flex flex-col bg-(--color-surface) overflow-hidden">
      {/* Theme toggle top-right */}
      <div className="absolute top-4 right-4 z-20">
        <ThemeToggle />
      </div>

      {/* Hero section */}
      <div className="flex flex-col lg:flex-row items-center justify-center flex-1 px-6 py-16 gap-12 max-w-6xl mx-auto w-full">

        {/* Left: copy + CTA */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="flex-1 max-w-md text-center lg:text-left"
        >
          <div className="inline-flex items-center gap-2 bg-(--color-surface-alt) border border-(--color-border) rounded-full px-4 py-1.5 mb-6">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs font-medium text-(--color-text-muted)">Sudoku diario disponible</span>
          </div>

          <h1 className="text-5xl sm:text-6xl font-black tracking-tight text-(--color-text) mb-4 leading-none">
            Sudoku
            <span className="text-(--color-primary)">.</span>
            <br />
            <span className="text-(--color-primary)">Online</span>
          </h1>

          <p className="text-(--color-text-muted) text-lg mb-8 leading-relaxed">
            Pon a prueba tu mente. Compite en rankings diarios y semanales.
            ¡El más rápido gana!
          </p>

          <motion.button
            onClick={handleGoogleLogin}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="w-full sm:w-auto flex items-center justify-center gap-3 bg-(--color-surface) border-2 border-(--color-border) hover:border-(--color-primary) rounded-xl px-8 py-4 font-semibold text-(--color-text) shadow-md hover:shadow-lg transition-all duration-200"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Entrar con Google
          </motion.button>

          <p className="mt-4 text-xs text-(--color-text-muted)">
            Sin contraseña · Gratis · Sin anuncios
          </p>
        </motion.div>

        {/* Right: animated decorative board */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex-shrink-0 w-[min(320px,80vw)]"
        >
          <div className="grid grid-cols-9 border-2 border-(--color-border-strong) rounded-lg overflow-hidden shadow-2xl aspect-square">
            {Array.from({ length: 81 }, (_, i) => {
              const row = Math.floor(i / 9)
              const col = i % 9
              const isThickRight = col === 2 || col === 5
              const isThickBottom = row === 2 || row === 5
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.005 }}
                  className={[
                    'aspect-square border border-(--color-border) transition-colors',
                    isThickRight ? 'border-r-2 border-r-(--color-border-strong)' : '',
                    isThickBottom ? 'border-b-2 border-b-(--color-border-strong)' : '',
                    HIGHLIGHT_CELLS.has(i) ? 'bg-(--color-cell-selected)' : 'bg-(--color-surface)',
                  ].join(' ')}
                />
              )
            })}
          </div>
        </motion.div>
      </div>

      {/* Features grid */}
      <div className="bg-(--color-surface-alt) border-t border-(--color-border) py-12 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-center text-sm font-semibold text-(--color-text-muted) uppercase tracking-widest mb-8">
            Todo lo que necesitas
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {FEATURES.map(({ icon, title, desc }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.07 }}
                className="bg-(--color-surface) border border-(--color-border) rounded-xl p-4 hover:border-(--color-primary) transition-colors"
              >
                <div className="text-2xl mb-2">{icon}</div>
                <p className="font-semibold text-sm text-(--color-text) mb-0.5">{title}</p>
                <p className="text-xs text-(--color-text-muted)">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Difficulty pills */}
      <div className="py-8 px-6 border-t border-(--color-border)">
        <div className="max-w-4xl mx-auto flex flex-wrap justify-center gap-3">
          {Object.values(DIFFICULTY_CONFIG).map(({ label, color }) => (
            <span
              key={label}
              className="px-4 py-1.5 rounded-full text-sm font-semibold border-2"
              style={{ color, borderColor: color + '44', backgroundColor: color + '11' }}
            >
              {label}
            </span>
          ))}
        </div>
        <p className="text-center text-xs text-(--color-text-muted) mt-4">
          © {new Date().getFullYear()} Sudoku Online
        </p>
      </div>
    </div>
  )
}
