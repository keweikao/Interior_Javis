import { motion } from 'framer-motion'
import { stagger, fadeUp } from '@/lib/motion'

export function Slide04Demo() {
  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="visible"
      className="w-full h-full flex flex-col items-center justify-center"
    >
      <motion.h2 variants={fadeUp} className="text-6xl font-bold text-gold mb-4">
        Live Demo
      </motion.h2>
      <motion.p variants={fadeUp} className="text-xl text-cream-dim mb-8">
        用剛才的案子走一遍：30 坪中古屋、屋齡 25 年、預算 180 萬
      </motion.p>
      <motion.a
        variants={fadeUp}
        href="https://q-check-demo.pages.dev"
        target="_blank"
        rel="noopener noreferrer"
        className="text-gold hover:text-cream transition-colors text-lg underline underline-offset-4"
      >
        https://q-check-demo.pages.dev
      </motion.a>
    </motion.div>
  )
}
