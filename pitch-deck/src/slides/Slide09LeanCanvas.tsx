import { motion } from 'framer-motion'
import { stagger, fadeUp } from '@/lib/motion'
import { SectionLabel } from '@/components/ui/SectionLabel'

function Cell({ title, color, children, className = '' }: {
  title: string; color: string; children: React.ReactNode; className?: string
}) {
  return (
    <motion.div variants={fadeUp} className={`bg-card rounded-lg p-3 ${className}`}>
      <p className={`text-xs font-bold mb-1.5 ${color}`}>{title}</p>
      <div className="text-xs space-y-1">{children}</div>
    </motion.div>
  )
}

function Li({ children, dim }: { children: string; dim?: boolean }) {
  return <p className={dim ? 'text-cream-dim' : 'text-cream'}>{children}</p>
}

export function Slide09LeanCanvas() {
  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="visible"
      className="w-full h-full flex flex-col justify-start px-14 pt-10 pb-12"
    >
      <SectionLabel text="精實畫布" />

      {/* Row 1: 5 columns */}
      <div className="grid grid-cols-[1fr_1fr_1fr_0.8fr_1fr] gap-2 mt-3 flex-1">
        <Cell title="問題" color="text-terra">
          <Li>1. 報價寫了但雙方對「含什麼」理解不同</Li>
          <Li>2. 保護、清運、防水等項目常被遺漏</Li>
          <Li>3. 資深設計師大量時間花在覆核</Li>
          <div className="mt-3 pt-2 border-t border-cream-dim/20">
            <p className="text-xs font-bold text-cream-dim mb-1">現有替代方案</p>
            <Li dim>Excel 模板、口頭傳承、出事後檢討</Li>
          </div>
        </Cell>

        <Cell title="解決方案" color="text-gold">
          <Li>1. 含/不含欄位強制寫清楚</Li>
          <Li>2. 25 條以上工序連動規則即時提醒</Li>
          <Li>3. 預算可行性快篩</Li>
          <Li>4. 風險報告讓資深只看需判斷的部分</Li>
          <Li>5. 專業判斷機制（覆寫加註原因）</Li>
        </Cell>

        <Cell title="獨特價值主張" color="text-gold">
          <p className="text-cream font-bold text-xs">讓報價階段的錯誤，不留到施工階段</p>
          <Li dim>不是報價工具，是風險管理系統</Li>
          <Li dim>培養設計師的底氣，不是取代設計師</Li>
          <div className="mt-3 pt-2 border-t border-cream-dim/20">
            <p className="text-xs font-bold text-gold mb-1">不公平競爭優勢</p>
            <Li>賀云本人就是目標用戶</Li>
            <Li>10 年實戰知識已編碼為規則</Li>
            <Li>用戶使用就會產生乾淨數據</Li>
            <Li dim>早期靠產業知識，中期靠知識飛輪</Li>
          </div>
        </Cell>

        <Cell title="關鍵指標" color="text-teal">
          <Li>追加金額變化</Li>
          <Li>覆核時間變化</Li>
          <Li>報價來回修改次數</Li>
          <Li>每月活躍專案數</Li>
          <Li>專業判斷使用頻率</Li>
        </Cell>

        <Cell title="目標客群" color="text-sage">
          <p className="text-gold font-bold text-xs">使用者：設計師（先免費用起來）</p>
          <p className="text-gold font-bold text-xs">付費者：進階功能的設計師或公司</p>
          <Li dim>3 人以上的中型設計公司</Li>
          <Li dim>年輕設計師需要資深覆核的團隊</Li>
          <div className="mt-3 pt-2 border-t border-cream-dim/20">
            <p className="text-xs font-bold text-cream-dim mb-1">通路</p>
            <Li dim>設計師自己覺得好用，推薦同事</Li>
            <Li dim>13 家分公司作為第一批種子</Li>
            <Li dim>50+ 家人脈口碑擴散</Li>
          </div>
        </Cell>
      </div>

      {/* Row 2: Cost / Revenue */}
      <div className="grid grid-cols-2 gap-2 mt-2 mb-2">
        <Cell title="成本結構" color="text-terra">
          <Li>開發人力（高克瑋，機會成本）</Li>
          <Li>伺服器託管費用趨近零</Li>
          <Li dim>燒錢率極低，目前不需外部資金</Li>
        </Cell>
        <Cell title="收入來源" color="text-sage">
          <Li>免費版：個人設計師，註冊就能用</Li>
          <Li>進階版：NT$ 990/月，分享同事、更多範本</Li>
          <Li>企業版：另議，覆核報告、多人管理、品牌 PDF</Li>
          <p className="text-gold font-bold text-xs mt-1">一次漏項損失 10-30 萬，月費 NT$ 990 幾乎零風險</p>
        </Cell>
      </div>

      <motion.p variants={fadeUp} className="text-xs text-clay font-bold text-center pb-2">
        最高風險：設計師願意離開 Excel 嗎？做法：先讓設計師免費用，好用自然擴散
      </motion.p>
    </motion.div>
  )
}
