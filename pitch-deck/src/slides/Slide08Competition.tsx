import { motion } from 'framer-motion'
import { useState } from 'react'
import { stagger, fadeUp } from '@/lib/motion'
import { SectionLabel } from '@/components/ui/SectionLabel'

interface Competitor {
  name: string
  promise: string
  detail: string
  x: number  // 0-100, left=general, right=interior-specific
  y: number  // 0-100, bottom=after, top=before
  color: string
  isMain?: boolean
}

const competitors: Competitor[] = [
  { name: 'Q-Check', promise: '這份報價有沒有埋地雷？', detail: '風險檢核 · 含/不含 · 專業判斷', x: 78, y: 82, color: '#C49756', isMain: true },
  { name: '易裝修 EZid', promise: '案子跑更快、團隊不亂', detail: '$1,200/月起 · 報價生成 · 流程管理', x: 73, y: 40, color: '#7EA09F' },
  { name: 'Excel 報價模板', promise: '我最懂自己的案子', detail: '免費 · 70-80% 設計師在用', x: 25, y: 52, color: '#A0968E' },
  { name: 'LINE 群組', promise: '傳個訊息就搞定了', detail: '免費 · 90% 在用 · 無法追溯', x: 25, y: 30, color: '#A0968E' },
  { name: '100室內設計', promise: '幫你找到下一個客戶', detail: '消費者媒合平台', x: 75, y: 17, color: '#9A94D0' },
  { name: '元欣估價系統', promise: '估價標準化不出錯', detail: '單機版 · 通用工程', x: 25, y: 75, color: '#7EA09F' },
  { name: 'Notion / Trello', promise: '什麼都能管 = 什麼都不深', detail: '', x: 20, y: 13, color: '#A0968E' },
]

export function Slide08Competition() {
  const [hover, setHover] = useState<string | null>(null)

  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="visible"
      className="w-full h-full flex flex-col justify-start px-14 pt-10 pb-12"
    >
      <SectionLabel text="競爭格局" />
      <motion.h2 variants={fadeUp} className="text-2xl font-bold mt-2 mb-4">
        每個玩家賣的是什麼承諾？
      </motion.h2>

      <motion.div variants={fadeUp} className="flex-1 relative">
        {/* Axes */}
        <div className="absolute left-1/2 top-0 bottom-8 w-px bg-cream-dim/20" />
        <div className="absolute top-1/2 left-0 right-0 h-px bg-cream-dim/20" />

        {/* Axis labels */}
        <span className="absolute left-2 top-1/2 translate-y-2 text-xs text-cream-dim">通用工具</span>
        <span className="absolute right-2 top-1/2 translate-y-2 text-xs text-cream-dim">室內設計專用</span>
        <span className="absolute left-1/2 -translate-x-1/2 top-0 text-xs text-cream-dim">事前預防</span>
        <span className="absolute left-1/2 -translate-x-1/2 bottom-2 text-xs text-cream-dim">事後管理</span>

        {/* Cards */}
        {competitors.map((c) => {
          const isHovered = hover === c.name
          const isMain = c.isMain
          return (
            <motion.div
              key={c.name}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 + c.x * 0.003, duration: 0.4 }}
              onMouseEnter={() => setHover(c.name)}
              onMouseLeave={() => setHover(null)}
              className="absolute -translate-x-1/2 -translate-y-1/2 cursor-default"
              style={{
                left: `${c.x}%`,
                top: `${100 - c.y}%`,
                zIndex: isMain ? 20 : isHovered ? 15 : 10,
              }}
            >
              {isMain && (
                <div
                  className="absolute -inset-3 rounded-xl border-2 border-dashed border-gold/60"
                  style={{ bottom: '-2.5rem' }}
                />
              )}
              <div
                className={`rounded-lg px-4 py-3 transition-all duration-200 ${
                  isMain ? 'min-w-[220px]' : 'min-w-[180px]'
                } ${isHovered ? 'scale-105' : ''}`}
                style={{
                  backgroundColor: isMain ? '#4D3D28' : '#4A423C',
                  borderLeft: `3px solid ${c.color}`,
                }}
              >
                <p className={`font-bold ${isMain ? 'text-base' : 'text-sm'}`}>{c.name}</p>
                <p className="text-xs mt-1" style={{ color: c.color }}>「{c.promise}」</p>
                {c.detail && <p className="text-xs text-cream-dim mt-1">{c.detail}</p>}
              </div>
              {isMain && (
                <p className="text-xs font-bold text-gold text-center mt-2">
                  唯一的事前預防 × 設計專用
                </p>
              )}
            </motion.div>
          )
        })}
      </motion.div>
    </motion.div>
  )
}
