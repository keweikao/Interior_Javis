import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { stagger, fadeUp, fadeIn } from '@/lib/motion'
import { SectionLabel } from '@/components/ui/SectionLabel'

const roles = [
  {
    id: 'junior',
    name: '年輕設計師',
    activeClass: 'bg-teal text-bg',
    products: ['工項骨架一鍵帶入', '含/不含欄位引導', '即時風險提醒附解釋'],
    relievers: ['骨架帶入不會遺漏', '提醒附「為什麼」是在學習', '預算快篩不接錯案'],
    creators: ['報價一次通過覆核', '累積知識漸漸不需提醒', '專業判斷紀錄展現成長'],
    jobs: ['獨立完成一份完整報價單', '不漏項、不寫模糊', '讓報價通過資深覆核'],
    pains: ['不知道自己漏了什麼', '要等資深空下來才敢發報價', '報價常被退回修改好幾次'],
    gains: ['報價品質提升', '不用等人就敢發', '客戶覺得很專業'],
  },
  {
    id: 'senior',
    name: '資深設計師',
    activeClass: 'bg-gold text-bg',
    products: ['風險檢核報告', '專業判斷清單', '系統已檢查項目清單'],
    relievers: ['風險報告過濾規則性問題', '只看需要經驗判斷的部分', '判斷紀錄分辨故意或疏忽'],
    creators: ['省下時間經營客戶接新案', '經驗透過規則庫傳承', '看判斷紀錄掌握成長速度'],
    jobs: ['覆核年輕人的報價', '同時管多個進行中案件', '把經驗傳下去'],
    pains: ['大量時間花在覆核', '同樣的錯教了很多次', '自己的案在延遲'],
    gains: ['覆核時間縮短', '經驗變成公司資產', '看得出年輕人成長'],
  },
  {
    id: 'boss',
    name: '老闆',
    activeClass: 'bg-sage text-bg',
    products: ['預算可行性快篩', '品質標準化系統', 'PDF 報價單匯出'],
    relievers: ['預算快篩避免接錯案', '品質標準化不靠個人', '報價格式統一'],
    creators: ['資深時間釋放接更多案', '年輕人更快能獨立作業', '知識留在公司不隨人走'],
    jobs: ['用現有人力接更多案', '控制追加風險和毛利', '培養年輕設計師獨立'],
    pains: ['人力有限案量受限', '年輕人要很久才獨立', '追加費用侵蝕毛利'],
    gains: ['同樣人力接更多案', '年輕設計師更快獨立', '品質不依賴特定個人'],
  },
]

function ItemList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-0.5">
      {items.map((item) => (
        <li key={item} className="text-[12px] text-cream leading-snug">{item}</li>
      ))}
    </ul>
  )
}

export function Slide05VPC() {
  const [active, setActive] = useState(0)
  const role = roles[active]!

  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="visible"
      className="w-full h-full flex flex-col justify-start px-14 pt-10 pb-12"
    >
      <SectionLabel text="價值主張畫布" />
      <motion.h2 variants={fadeUp} className="text-2xl font-bold mt-2 mb-4">
        三個角色的價值互相增強
      </motion.h2>

      {/* Tabs */}
      <motion.div variants={fadeUp} className="flex gap-3 mb-4">
        {roles.map((r, i) => (
          <button
            key={r.id}
            onClick={(e) => { e.stopPropagation(); setActive(i) }}
            className={`px-5 py-2 rounded-lg text-sm font-bold transition-all ${
              i === active ? r.activeClass : 'bg-card text-cream-dim hover:text-cream'
            }`}
          >
            {r.name}
          </button>
        ))}
      </motion.div>

      {/* VPC Canvas */}
      <AnimatePresence mode="wait">
        <motion.div
          key={role.id}
          variants={fadeIn}
          initial="hidden"
          animate="visible"
          exit="hidden"
          className="flex-1 flex gap-5 items-stretch min-h-0"
        >
          {/* LEFT: Value Map (Square) */}
          <div className="flex-1 relative">
            <div className="absolute inset-0 rounded-2xl border-2 border-gold/30" />
            <div className="relative h-full p-4 flex flex-col">
              <p className="text-xs font-bold text-gold mb-3 tracking-wider">價值主張</p>

              <div className="grid grid-rows-3 gap-2 flex-1">
                {/* Products & Services */}
                <div className="bg-card/60 rounded-xl p-3">
                  <p className="text-[11px] font-bold text-gold mb-2">產品與服務</p>
                  <ItemList items={role.products} />
                </div>

                {/* Pain Relievers */}
                <div className="bg-card/60 rounded-xl p-3">
                  <p className="text-[11px] font-bold text-terra mb-2">怎麼減少痛苦</p>
                  <ItemList items={role.relievers} />
                </div>

                {/* Gain Creators */}
                <div className="bg-card/60 rounded-xl p-3">
                  <p className="text-[11px] font-bold text-sage mb-2">怎麼創造收穫</p>
                  <ItemList items={role.creators} />
                </div>
              </div>
            </div>
          </div>

          {/* Connector arrow */}
          <div className="flex items-center">
            <div className="w-8 h-px bg-gold/40 relative">
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-0 h-0 border-l-[6px] border-l-gold/40 border-y-[4px] border-y-transparent" />
            </div>
          </div>

          {/* RIGHT: Customer Profile (Circle) */}
          <div className="flex-1 relative flex items-center justify-center">
            {/* Outer circle */}
            <div className="absolute inset-2 rounded-full border-2 border-cream-dim/20" />

            <div className="relative w-full h-full p-5 flex flex-col justify-center">
              <p className="text-xs font-bold text-gold mb-3 tracking-wider text-center">顧客輪廓</p>

              <div className="space-y-2 max-w-[380px] mx-auto">
                {/* Customer Jobs */}
                <div className="bg-card/60 rounded-xl p-3">
                  <p className="text-[11px] font-bold text-gold mb-2">顧客任務</p>
                  <ItemList items={role.jobs} />
                </div>

                {/* Pains */}
                <div className="bg-card/60 rounded-xl p-3">
                  <p className="text-[11px] font-bold text-terra mb-2">痛點</p>
                  <ItemList items={role.pains} />
                </div>

                {/* Gains */}
                <div className="bg-card/60 rounded-xl p-3">
                  <p className="text-[11px] font-bold text-sage mb-2">期望收穫</p>
                  <ItemList items={role.gains} />
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      <motion.p variants={fadeUp} className="text-sm text-gold font-medium mt-3 mb-2 text-center">
        三者互相增強：年輕人底氣提升 → 資深覆核減少 → 老闆產能提升
      </motion.p>
    </motion.div>
  )
}
