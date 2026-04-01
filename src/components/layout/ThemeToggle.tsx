import { motion } from 'framer-motion'
import { useUIStore } from '@/store/ui-store'

export function ThemeToggle() {
  const { theme, toggleTheme } = useUIStore()
  const isDark = theme === 'dark'

  return (
    <motion.button
      onClick={toggleTheme}
      whileTap={{ scale: 0.9 }}
      className="relative w-12 h-6 rounded-full transition-colors duration-300 flex items-center px-0.5"
      style={{ backgroundColor: isDark ? 'var(--color-primary)' : 'var(--color-border)' }}
      aria-label={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
    >
      <motion.div
        className="w-5 h-5 rounded-full bg-white shadow-sm flex items-center justify-center text-[10px]"
        animate={{ x: isDark ? 24 : 0 }}
        transition={{ type: 'spring', stiffness: 500, damping: 35 }}
      >
        {isDark ? '🌙' : '☀️'}
      </motion.div>
    </motion.button>
  )
}
