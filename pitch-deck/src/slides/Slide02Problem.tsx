import { motion } from 'framer-motion'
import { stagger, fadeUp } from '@/lib/motion'
import { SectionLabel } from '@/components/ui/SectionLabel'

export function Slide02Problem() {
  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="visible"
      className="w-full h-full flex flex-col justify-start px-14 pt-10 pb-12"
    >
      <SectionLabel text="問題" />
      <motion.h2 variants={fadeUp} className="text-2xl font-bold mt-2 mb-4">
        入行 2 年的設計師接了 30 坪中古屋翻新案
      </motion.h2>

      <div className="flex gap-8">
        {/* Left: Story */}
        <motion.div variants={fadeUp} className="flex-1 space-y-4">
          <p className="text-sm">5 樓無電梯、屋齡 25 年、業主預算 180 萬</p>
          <p className="text-sm text-clay">報價漏了防水重做、垃圾清運、配電箱更換</p>
          <p className="text-sm text-terra font-bold">施工後追加 35 萬 — 業主崩潰、公司賠錢</p>
          <p className="text-sm text-gold font-medium mt-4">
            報價階段修復 vs 施工階段修復，代價差 10 到 20 倍
          </p>
        </motion.div>

        {/* Right: Real quotation + Pain summary */}
        <motion.div variants={stagger} className="w-96 space-y-4">
          <motion.div variants={fadeUp} className="relative">
            <img
              src="/quotation-sample.png"
              alt="真實報價單"
              className="w-full rounded-lg opacity-40 blur-[1px]"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-sm font-bold text-cream bg-bg/80 px-4 py-2 rounded">
                現況：Excel 報價單，零風險檢查
              </span>
            </div>
          </motion.div>
          <div className="grid grid-cols-2 gap-2">
            {[
              { t: '認知落差', d: '「含什麼」理解不同' },
              { t: '漏項', d: '清運、防水常遺漏' },
              { t: '現場低估', d: '追加費用更傷' },
              { t: '預算不合理', d: '整案利潤全失' },
            ].map((p) => (
              <motion.div key={p.t} variants={fadeUp} className="bg-card rounded-lg px-3 py-2">
                <p className="text-xs font-bold text-gold">{p.t}</p>
                <p className="text-[11px] text-cream-dim">{p.d}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Why no one solved it */}
      <motion.div variants={fadeUp} className="mt-auto pb-2">
        <div className="border-t border-cream-dim/20 pt-4 mb-4">
          <p className="text-sm font-bold text-gold mb-3">為什麼現有方案都解決不了？</p>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {[
            { n: 'Excel 模板', r: '有格式但沒有風險檢查，知識留在人腦裡' },
            { n: '口頭傳承', r: '資深沒時間一對一教，帶 3 個人就是極限' },
            { n: '工程管理軟體', r: '管施工不管報價，對設計公司太重太貴' },
          ].map((f) => (
            <motion.div key={f.n} variants={fadeUp} className="bg-card rounded-lg p-3">
              <p className="text-sm font-bold text-terra">{f.n}</p>
              <p className="text-xs text-cream-dim mt-1">{f.r}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  )
}
