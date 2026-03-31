import { motion } from 'framer-motion'
import { stagger, fadeUp } from '@/lib/motion'
import { SectionLabel } from '@/components/ui/SectionLabel'

export function Slide02Problem() {
  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="visible"
      className="w-full h-full flex flex-col justify-start px-[6%] pt-[4%] pb-[3%]"
    >
      <SectionLabel text="問題" />
      <motion.h2 variants={fadeUp} className="text-4xl font-bold mt-3 mb-6">
        入行 2 年的設計師接了 30 坪中古屋翻新案
      </motion.h2>

      <div className="flex gap-10 flex-1 min-h-0 overflow-hidden">
        {/* Left: Story + Pain cards */}
        <motion.div variants={fadeUp} className="flex-1 space-y-5">
          <p className="text-xl">5 樓無電梯、屋齡 25 年、業主預算 180 萬</p>
          <p className="text-xl text-clay">報價漏了防水重做、垃圾清運、配電箱更換</p>
          <p className="text-xl text-terra font-bold">施工後追加 35 萬 — 業主崩潰、公司賠錢</p>
          <p className="text-lg text-gold font-medium mt-2">
            報價階段修復 vs 施工階段修復，代價差 10 到 20 倍
          </p>
          <div className="grid grid-cols-2 gap-3 pt-2">
            {[
              { t: '認知落差', d: '「含什麼」理解不同' },
              { t: '漏項', d: '清運、防水常遺漏' },
              { t: '現場低估', d: '追加費用更傷' },
              { t: '預算不合理', d: '整案利潤全失' },
            ].map((p) => (
              <motion.div key={p.t} variants={fadeUp} className="bg-card rounded-lg px-4 py-3">
                <p className="text-base font-bold text-gold">{p.t}</p>
                <p className="text-sm text-cream-dim">{p.d}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Right: Real quotation — constrained to this section */}
        <motion.div variants={fadeUp} className="w-[35%] relative shrink-0">
          <img
            src="/quotation-sample.png"
            alt="真實報價單"
            className="w-full h-full object-cover object-top rounded-lg opacity-40 blur-[1px]"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-lg font-bold text-cream bg-bg/80 px-5 py-3 rounded">
              現況：Excel 報價單，零風險檢查
            </span>
          </div>
        </motion.div>
      </div>

      {/* Why no one solved it */}
      <motion.div variants={fadeUp} className="mt-auto pt-4">
        <div className="border-t border-cream-dim/20 pt-4 mb-4">
          <p className="text-lg font-bold text-gold mb-3">為什麼現有方案都解決不了？</p>
        </div>
        <div className="grid grid-cols-3 gap-5">
          {[
            { n: 'Excel 模板', r: '有格式但沒有風險檢查，知識留在人腦裡' },
            { n: '口頭傳承', r: '資深沒時間一對一教，帶 3 個人就是極限' },
            { n: '工程管理軟體', r: '管施工不管報價，對設計公司太重太貴' },
          ].map((f) => (
            <motion.div key={f.n} variants={fadeUp} className="bg-card rounded-lg p-4">
              <p className="text-base font-bold text-terra">{f.n}</p>
              <p className="text-sm text-cream-dim mt-1">{f.r}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  )
}
