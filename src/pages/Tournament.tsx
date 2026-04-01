import { Header } from '@/components/layout/Header'
import { motion } from 'framer-motion'

export function Tournament() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-sm"
        >
          <div className="text-6xl mb-6">🏆</div>
          <h1 className="text-2xl font-bold text-(--color-text) mb-3">Torneos</h1>
          <p className="text-(--color-text-muted) mb-8">
            Los torneos llegaran pronto. Compite contra otros jugadores en tiempo real con puzzles exclusivos.
          </p>
          <div className="bg-(--color-surface-alt) border border-(--color-border) rounded-xl p-4">
            <p className="text-sm font-semibold text-(--color-text) mb-1">Próximamente</p>
            <p className="text-xs text-(--color-text-muted)">
              Serás notificado cuando el primer torneo esté disponible
            </p>
          </div>
        </motion.div>
      </main>
    </div>
  )
}
