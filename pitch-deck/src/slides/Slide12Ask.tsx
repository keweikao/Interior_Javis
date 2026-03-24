import { motion } from 'framer-motion'
import { stagger, fadeUp } from '@/lib/motion'

export function Slide12Ask() {
  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="visible"
      className="w-full h-full flex flex-col justify-center px-14"
    >
      <motion.div variants={fadeUp} className="w-12 h-0.5 bg-gold mb-4" />
      <motion.h2 variants={fadeUp} className="text-4xl font-bold text-gold mb-8">
        下一步
      </motion.h2>

      <div className="space-y-4">
        <motion.p variants={fadeUp} className="text-xl">
          1. 最小可行產品預計 4-5 週內上線
        </motion.p>
        <motion.p variants={fadeUp} className="text-xl">
          2. 賀云公司內部用真實案件測試
        </motion.p>
        <motion.p variants={fadeUp} className="text-xl">
          3. 徵求 3-5 家設計公司加入測試
        </motion.p>
        <motion.p variants={fadeUp} className="text-2xl text-gold font-bold">
          4. 希望業師引薦設計公司老闆或產業資源
        </motion.p>
      </div>

      <motion.p variants={fadeUp} className="text-base text-cream-dim mt-12">
        Q-Check — 室內裝修公司的風險管理決策系統
      </motion.p>
      <motion.p variants={fadeUp} className="text-sm text-cream-dim/70 mt-2">
        第六組：呂賀云 / 高克瑋　·　hello@qcheck.tw
      </motion.p>
    </motion.div>
  )
}
