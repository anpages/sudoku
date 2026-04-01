import { AnimatePresence, motion } from 'framer-motion'
import { useUIStore } from '@/store/ui-store'

const TYPE_STYLES = {
  success: 'bg-green-600 text-white',
  error: 'bg-red-600 text-white',
  info: 'bg-(--color-primary) text-white',
}

export function ToastContainer() {
  const { toasts, removeToast } = useUIStore()

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 items-center pointer-events-none">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            onClick={() => removeToast(t.id)}
            className={[
              'pointer-events-auto px-5 py-3 rounded-xl shadow-lg text-sm font-medium cursor-pointer max-w-xs text-center',
              TYPE_STYLES[t.type],
            ].join(' ')}
          >
            {t.message}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
