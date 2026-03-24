import { motion } from 'framer-motion'
import { stagger, fadeUp } from '@/lib/motion'
import { SectionLabel } from '@/components/ui/SectionLabel'

const funnel = [
  { label: '總潛在市場', desc: '全台設計公司約 17,000 家', w: '90%' },
  { label: '可服務市場', desc: '3 人以上中型公司約 3,000-4,000 家', w: '70%' },
  { label: '首年目標', desc: '人脈能觸及 50-100 家', w: '45%' },
]

const reasons = [
  { t: '老屋翻新潮', d: '500 萬戶老屋加上政府 50 億補助，案量增加但產能不變' },
  { t: '報價失準代價更高', d: '材料成本上漲 6.8%，報價少算就是直接賠錢' },
  { t: '經驗傳承斷層', d: '資深設計師退休潮，年輕人學不到也沒人教' },
  { t: '沒人做這件事', d: '目前沒人從風險管理切入，要趁空白搶先建立用戶' },
]

export function Slide06Market() {
  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="visible"
      className="w-full h-full flex flex-col justify-center px-[6%] py-[4%]"
    >
      <SectionLabel text="市場機會" />
      <motion.h2 variants={fadeUp} className="text-4xl font-bold mt-3 mb-8">
        台灣裝修年產值 5,500 億，風險管理是空白地帶
      </motion.h2>

      <div className="flex gap-10">
        {/* Left: Funnel */}
        <motion.div variants={stagger} className="flex-1 space-y-5">
          {funnel.map((f, i) => {
            const colors = ['bg-[#4A3F38]', 'bg-[#5A4E45]', 'bg-gold']
            return (
              <motion.div
                key={f.label}
                variants={fadeUp}
                className={`${colors[i]} rounded-lg px-6 py-4 flex items-center justify-between`}
                style={{ width: f.w }}
              >
                <span className="font-bold text-lg">{f.label}</span>
                <span className="text-base">{f.desc}</span>
              </motion.div>
            )
          })}
        </motion.div>

        {/* Right: Why Now */}
        <motion.div variants={fadeUp} className="w-[45%] bg-card rounded-xl p-6">
          <p className="text-lg font-bold text-gold mb-4">為什麼是現在</p>
          <div className="space-y-4">
            {reasons.map((r) => (
              <div key={r.t}>
                <p className="text-base font-bold text-gold">{r.t}</p>
                <p className="text-base text-cream mt-1">{r.d}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}
