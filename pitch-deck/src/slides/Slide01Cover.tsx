import { motion } from 'framer-motion'
import { stagger, fadeUp } from '@/lib/motion'

export function Slide01Cover() {
  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="visible"
      className="w-full h-full flex flex-col justify-center px-20"
    >
      <motion.div variants={fadeUp} className="w-12 h-0.5 bg-gold mb-6" />
      <motion.h1 variants={fadeUp} className="text-7xl font-bold text-gold mb-4 tracking-tight">
        Q-Check
      </motion.h1>
      <motion.p variants={fadeUp} className="text-4xl font-light mb-2">
        室內裝修公司的<span className="font-bold">風險管理決策系統</span>
      </motion.p>
      <motion.p variants={fadeUp} className="text-xl text-cream-dim mt-4">
        讓報價階段的錯誤，不會留到施工階段。
      </motion.p>
      <motion.div variants={fadeUp} className="mt-16 text-sm text-cream-dim/70 space-y-1">
        <p>第六組：呂賀云 / 高克瑋</p>
        <p>業師：張佳欽　　2026-03-24</p>
      </motion.div>
    </motion.div>
  )
}
