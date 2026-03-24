import { motion } from 'framer-motion'
import { fadeUp } from '@/lib/motion'
import type { ReactNode } from 'react'

interface Props {
  children: ReactNode
  className?: string
  accent?: string
}

export function Card({ children, className = '', accent }: Props) {
  return (
    <motion.div
      variants={fadeUp}
      className={`bg-card rounded-xl p-6 ${className}`}
      style={accent ? { borderLeft: `3px solid ${accent}` } : undefined}
    >
      {children}
    </motion.div>
  )
}
