import { motion } from 'framer-motion'
import { stagger, fadeUp } from '@/lib/motion'
import { SectionLabel } from '@/components/ui/SectionLabel'

function Quad({ title, children, className = '' }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <motion.div variants={fadeUp} className={`bg-card rounded-xl p-4 ${className}`}>
      <p className="text-sm font-bold text-gold mb-2">{title}</p>
      {children}
    </motion.div>
  )
}

function Li({ children, color = 'text-cream' }: { children: string; color?: string }) {
  return <p className={`text-xs ${color} mb-1`}>{children}</p>
}

export function Slide07POCD() {
  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="visible"
      className="w-full h-full flex flex-col justify-start px-14 pt-10 pb-12"
    >
      <SectionLabel text="POCD 分析" />
      <div className="flex-1 grid grid-cols-2 gap-3 mt-3">
        <Quad title="People 團隊">
          <Li>呂賀云：10 年以上設計師，她本人就是目標用戶</Li>
          <Li>高克瑋：10 年銷售營運經驗，iCHEF 銷售流程 AI 導入經驗</Li>
          <Li>擅長把專家知識變成可執行的系統</Li>
          <Li color="text-gold">共同創辦人就是目標用戶，對市場的理解極深</Li>
        </Quad>

        <Quad title="Opportunity 機會">
          <Li>全台約 17,000 家設計公司</Li>
          <Li>目標客群：3 人以上中型公司約 3,000-4,000 家</Li>
          <Li>賀云的 13 家分公司加上 50+ 家直接人脈</Li>
          <Li color="text-gold">從風險管理角度切入，目前沒有直接競品</Li>
        </Quad>

        <Quad title="Context 環境">
          <Li color="text-sage">有利：老屋翻新潮、裝潢糾紛頻繁、部署成本趨近零</Li>
          <Li color="text-terra">不利：設計業數位化程度低、各公司格式不統一</Li>
          <Li>擴散方式：設計師自己覺得好用 → 推薦同事 → 公司導入</Li>
          <Li>類似 Figma 的擴散路徑，從使用者端長出來</Li>
        </Quad>

        <Quad title="Deal 商業模式">
          <Li>免費版：個人設計師，註冊就能用</Li>
          <Li>進階版：NT$ 990/月，分享給同事、更多範本</Li>
          <Li>企業版：另議，覆核報告、多人管理、品牌 PDF</Li>
          <Li>擴張：13 家分公司 → 50+ 家人脈 → 口碑擴散</Li>
          <Li color="text-gold">獲客成本趨近零　部署成本趨近零</Li>
        </Quad>
      </div>
    </motion.div>
  )
}
