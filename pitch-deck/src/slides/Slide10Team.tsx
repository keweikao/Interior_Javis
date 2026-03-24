import { motion } from 'framer-motion'
import { stagger, fadeUp } from '@/lib/motion'
import { SectionLabel } from '@/components/ui/SectionLabel'

export function Slide10Team() {
  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="visible"
      className="w-full h-full flex flex-col justify-start px-14 pt-10 pb-12"
    >
      <SectionLabel text="為什麼是我們" />
      <motion.h2 variants={fadeUp} className="text-2xl font-bold mt-2 mb-4">
        共同創辦人就是目標用戶本人
      </motion.h2>

      <div className="grid grid-cols-2 gap-4">
        <motion.div variants={fadeUp} className="bg-card rounded-xl p-4 flex gap-4">
          <img
            src="/vivian.jpg"
            alt="呂賀云"
            className="w-24 h-24 rounded-xl object-cover object-top shrink-0"
          />
          <div>
            <h3 className="text-xl font-bold text-gold">呂賀云</h3>
            <p className="text-sm text-cream-dim mt-1 mb-3">共同創辦人 / 產品定義 / 設計師</p>
            <div className="space-y-1.5 text-sm">
              <p>10 年以上室內設計實戰經驗</p>
              <p>她親身經歷了所有痛點，她就是用戶</p>
              <p>定義了產品哲學和 25 條以上的風險規則</p>
              <p>13 家分公司是天然的第一批用戶</p>
            </div>
          </div>
        </motion.div>

        <motion.div variants={fadeUp} className="bg-card rounded-xl p-4 flex gap-4">
          <img
            src="/stephen.jpg"
            alt="高克瑋"
            className="w-24 h-24 rounded-xl object-cover object-top shrink-0"
          />
          <div>
            <h3 className="text-xl font-bold text-gold">高克瑋</h3>
            <p className="text-sm text-cream-dim mt-1 mb-3">技術創辦人 / 銷售營運</p>
            <div className="space-y-1.5 text-sm">
              <p>iCHEF Sales Ops Director 經驗</p>
              <p>擅長把專家知識變成可執行的系統</p>
              <p>獨立完成最小可行產品開發，不需外部資金</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Moat */}
      <motion.div variants={fadeUp} className="bg-card rounded-xl p-4 mt-4">
        <p className="text-sm font-bold text-gold mb-2">壁壘</p>
        <p className="text-sm">
          <span className="text-cream">早期：專家知識 — 10 年經驗不是三個月能複製的</span>
        </p>
        <p className="text-xs text-cream-dim mt-1 ml-4">
          重點不是複製規則，是複製「知道哪些規則重要」的判斷力
        </p>
        <p className="text-sm text-gold mt-3">
          中期：每一家新客戶在報價上的回饋都讓系統更好，對下一家客戶更有價值
        </p>
      </motion.div>
    </motion.div>
  )
}
