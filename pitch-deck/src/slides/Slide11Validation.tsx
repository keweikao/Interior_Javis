import { motion } from 'framer-motion'
import { stagger, fadeUp } from '@/lib/motion'
import { SectionLabel } from '@/components/ui/SectionLabel'

const risks = [
  { level: '致命', color: 'bg-terra', q: '設計師願意把報價從 Excel 搬到新系統嗎？', method: '賀云公司實測 2 週，觀察使用完成率' },
  { level: '致命', color: 'bg-terra', q: '其他設計公司有一樣的痛點，而且願意付費嗎？', method: '5 家訪談加上 3-5 家測試' },
  { level: '高', color: 'bg-clay', q: '含/不含機制真的能減少客戶追加糾紛嗎？', method: '追蹤 3 個案子的追加金額，和歷史平均比較' },
  { level: '中', color: 'bg-gold', q: '風險報告能讓覆核時間明顯縮短嗎？', method: '賀云實測覆核 5 份報告，計時比較' },
]

export function Slide11Validation() {
  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="visible"
      className="w-full h-full flex flex-col justify-start px-14 pt-10 pb-12"
    >
      <SectionLabel text="驗證計畫和風險" />
      <motion.h2 variants={fadeUp} className="text-2xl font-bold mt-2 mb-5">
        我們知道什麼還沒被驗證
      </motion.h2>

      <motion.div variants={stagger} className="space-y-3 flex-1">
        {risks.map((r) => (
          <motion.div
            key={r.q}
            variants={fadeUp}
            className="bg-card rounded-lg px-4 py-3 flex items-center gap-4"
          >
            <span className={`${r.color} text-white text-xs font-bold px-3 py-1 rounded`}>
              {r.level}
            </span>
            <p className="flex-1 font-bold text-sm">{r.q}</p>
            <p className="text-sm text-cream-dim w-80 text-right">{r.method}</p>
          </motion.div>
        ))}
      </motion.div>

      <motion.div variants={fadeUp} className="bg-[#2E382E] rounded-lg px-4 py-3 mt-3 mb-2">
        <p className="text-sm text-gold font-bold">
          初步實測：覆核時間從 30 分鐘降至 10 分鐘（賀云測試 5 份報告）
        </p>
      </motion.div>
    </motion.div>
  )
}
