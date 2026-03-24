import { motion } from 'framer-motion'
import { fadeUp } from '@/lib/motion'

export function SectionLabel({ text }: { text: string }) {
  return (
    <motion.div variants={fadeUp} className="flex items-center gap-3 mb-2">
      <div className="w-8 h-0.5 bg-gold" />
      <span className="text-gold text-sm font-medium tracking-wide">{text}</span>
    </motion.div>
  )
}
