import { motion } from 'framer-motion'
import { stagger, fadeUp } from '@/lib/motion'
import { SectionLabel } from '@/components/ui/SectionLabel'

const steps = [
  {
    num: '01',
    name: '預算快篩',
    question: '這案子值不值得接？',
    desc: '輸入坪數、屋齡、預算，系統判斷預算是否合理',
    color: 'border-gold text-gold',
    bg: 'bg-gold/10',
  },
  {
    num: '02',
    name: '結構化報價',
    question: '該報哪些項目？',
    desc: '選案件類型自動帶入工項骨架，每項填寫含什麼、不含什麼',
    color: 'border-teal text-teal',
    bg: 'bg-teal/10',
  },
  {
    num: '03',
    name: '即時風險提醒',
    question: '有沒有漏掉什麼？',
    desc: '根據 25 條以上工序連動規則，在旁邊即時提示風險和漏項',
    color: 'border-clay text-clay',
    bg: 'bg-clay/10',
  },
  {
    num: '04',
    name: '完成確認',
    question: '可以安心送出了嗎？',
    desc: '逐項確認後產出 PDF 報價單和內部風險報告',
    color: 'border-sage text-sage',
    bg: 'bg-sage/10',
  },
]

export function Slide03Solution() {
  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="visible"
      className="w-full h-full flex flex-col px-14 pt-10 pb-12"
    >
      <SectionLabel text="Q-Check 怎麼運作" />
      <motion.h2 variants={fadeUp} className="text-2xl font-bold mt-1 mb-1">
        培養設計師，不是取代設計師。
      </motion.h2>
      <motion.p variants={fadeUp} className="text-xs text-cream-dim mb-4">
        — 呂賀云（共同創辦人 / 10 年資深設計師）
      </motion.p>

      <div className="flex gap-5 flex-1 min-h-0">
        {/* Left: 4-step flow */}
        <motion.div variants={stagger} className="flex-1 flex flex-col gap-2">
          {steps.map((s) => (
            <motion.div
              key={s.num}
              variants={fadeUp}
              className={`flex-1 rounded-lg border-l-3 ${s.color} ${s.bg} px-4 py-2.5 flex items-center gap-3`}
            >
              <span className={`text-xl font-bold opacity-30 ${s.color} shrink-0`}>
                {s.num}
              </span>
              <div className="min-w-0">
                <div className="flex items-baseline gap-2">
                  <span className="font-bold text-sm">{s.name}</span>
                  <span className={`text-xs ${s.color}`}>{s.question}</span>
                </div>
                <p className="text-xs text-cream-dim mt-0.5">{s.desc}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Right: 專業判斷 */}
        <motion.div variants={fadeUp} className="w-[300px] bg-card rounded-xl p-4 flex flex-col">
          <p className="text-xs text-cream-dim mb-1">貫穿整個流程的關鍵機制</p>
          <p className="text-base font-bold text-gold mb-3">「專業判斷」</p>

          <div className="space-y-2 text-xs flex-1">
            <div className="bg-clay/10 rounded-lg px-3 py-2">
              <p className="text-clay font-medium">系統提醒</p>
              <p className="text-cream-dim mt-0.5">「這個單價低於市場行情」</p>
            </div>

            <div className="text-center text-cream-dim/30 text-xs leading-none">↓</div>

            <div className="bg-bg/50 rounded-lg px-3 py-2 space-y-1">
              <p className="font-medium text-xs">設計師可以選擇</p>
              <p className="text-cream-dim">接受建議，調整單價</p>
              <p className="text-cream-dim">
                或行使<span className="text-gold font-medium">專業判斷</span>，寫下原因
              </p>
              <p className="text-cream-dim/50 italic text-[11px]">
                「合作多年工班，有特殊價格」
              </p>
            </div>

            <div className="text-center text-cream-dim/30 text-xs leading-none">↓</div>

            <div className="bg-gold/10 rounded-lg px-3 py-2">
              <p className="text-gold font-medium">系統記錄，不再重複提醒</p>
              <p className="text-cream-dim mt-0.5">資深覆核時可見所有判斷紀錄</p>
            </div>
          </div>

          <p className="text-xs text-gold font-medium mt-2 pt-2 border-t border-cream-dim/20">
            讓系統分得出「故意的」和「不小心的」
          </p>
        </motion.div>
      </div>
    </motion.div>
  )
}
