import { AnimatePresence, motion } from 'framer-motion'
import { slideVariants } from '@/lib/motion'
import type { ReactNode } from 'react'

interface Props {
  slideKey: number
  direction: number
  children: ReactNode
}

export function SlideContainer({ slideKey, direction, children }: Props) {
  return (
    <div className="relative h-full w-full overflow-hidden">
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={slideKey}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          className="absolute inset-0 flex items-center justify-center"
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
