# Nooko — 裝修報價防呆守衛

B2B 的「裝修報價單防呆助理」，為室內設計公司和統包商在發包前，自動揪出報價單中會導致**現場停工、做錯重來、嚴重漏項**的致命錯誤。

> 把資深老手的經驗變成自動化流程，讓年輕設計師也能發出零失誤的清單。

## 核心功能 — 三大防呆關卡

| 關卡 | 功能 | 範例 |
|------|------|------|
| **漏項檢查** | 工序相依性驗證 — 有 A 工項就必須有 B | 報價有「全熱交換器」→ 自動檢查有沒有報「洗洞」 |
| **衝突檢查** | 現場條件 × 建材/工法限制矩陣 | 「無電梯 5 樓」+「240cm 大板磚」→ 缺少「吊車費」 |
| **數量異常** | 坪數與工項數量的經驗比例檢查 | 室內 20 坪，油漆只報 25 坪（正常應約 60 坪） |

## 技術棧（Better-T Stack）

| 層級 | 技術 |
|------|------|
| Runtime | Bun |
| Frontend | React + TanStack Router |
| Backend | Hono + tRPC |
| Database | PostgreSQL (Neon) + Drizzle ORM |
| Auth | Better-Auth（多租戶） |
| UI | shadcn/ui + Tailwind CSS |
| AI | Google Gemini |
| Monorepo | Turborepo |

## 專案結構

```
Nooko/
├── specs/003-quotation-guardian/  # 產品規格與知識庫
│   ├── PRODUCT_BRIEF.md           # 產品簡報
│   ├── PRIOR_KNOWLEDGE.md         # 領域知識
│   ├── knowledge-base-tw-renovation.md  # 台灣裝修知識庫
│   ├── schema-design.md           # 資料庫 schema 設計
│   └── plan.md                    # 實作計畫
└── README.md
```

## License

Private — All rights reserved.
