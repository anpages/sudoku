import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { DIFFICULTY_CONFIG } from '@/shared/constants'
import type { Difficulty } from '@/shared/types'

interface Props {
  current?: Difficulty
}

export function DifficultyPicker({ current }: Props) {
  const navigate = useNavigate()

  return (
    <div className="flex flex-wrap gap-2 justify-center">
      {(Object.entries(DIFFICULTY_CONFIG) as [Difficulty, typeof DIFFICULTY_CONFIG[Difficulty]][]).map(
        ([key, config]) => (
          <motion.button
            key={key}
            whileTap={{ scale: 0.93 }}
            onClick={() => navigate(`/juego/${key}`)}
            className={[
              'px-4 py-1.5 rounded-full text-sm font-semibold border-2 transition-all',
              current === key
                ? 'text-white'
                : 'hover:opacity-80',
            ].join(' ')}
            style={
              current === key
                ? { backgroundColor: config.color, borderColor: config.color }
                : { color: config.color, borderColor: config.color + '66', backgroundColor: config.color + '11' }
            }
          >
            {config.label}
          </motion.button>
        ),
      )}
    </div>
  )
}
