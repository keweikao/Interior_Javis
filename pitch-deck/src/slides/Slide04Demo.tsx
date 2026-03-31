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
      <motion.h2 variants={fadeUp} className="text-7xl font-bold text-gold mb-6">
        Live Demo
      </motion.h2>
      <motion.p variants={fadeUp} className="text-2xl text-cream-dim mb-10">
        請讓我們用真的報價單走一遍
      </motion.p>
      <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center gap-5">
        <a
          href="https://q-check-demo.pages.dev"
          target="_blank"
          rel="noopener noreferrer"
          className="px-8 py-4 rounded-lg bg-gold text-bg text-lg font-semibold hover:bg-gold/90 transition-colors"
        >
          開啟 Demo
        </a>
        <a
          href="https://q-check-demo.pages.dev/demo-quotation.pdf"
          download
          className="px-8 py-4 rounded-lg border border-gold/40 text-gold text-lg font-semibold hover:bg-gold/10 transition-colors"
        >
          下載範例報價單 PDF
        </a>
      </motion.div>
    </motion.div>
  )
}
