# Q-Check — 設計公司風險管理決策系統

> 我們不是在檢查錯誤，我們是讓錯誤一開始就不會發生。

Q-Check 是一套為室內設計公司打造的風險管理系統。在報價階段就攔截問題，減少施工階段的反覆修改，讓資深設計師省下 70% 的覆核時間。

**Live Demo**: https://q-check-demo.pages.dev

## 核心價值

| 痛點 | Q-Check 怎麼解決 |
|------|-----------------|
| 認知落差（報價寫了但雙方理解不同） | 每個工項強制填寫「含什麼 / 不含什麼」 |
| 漏項（保護工程、清運、防水常被忘記） | 25 條工序連動規則即時提醒 |
| 現場條件沒考慮到 | 現場條件 x 工項衝突矩陣 |
| 預算不合理（接了不該接的案子） | 預算可行性快篩（Layer 0） |
| 資深設計師覆核佔太多時間 | 風險檢核報告：系統查 70%，資深只看 30% |

## 產品哲學

> 培養設計師，不是取代設計師。設計師的底氣來自知道自己準備萬無一失，不是知道自己有超屌工具。
> — Vivian（共同創辦人 / 設計師）

- 系統找風險（效率）→ 設計師懂風險（底氣）→ 設計師做決定（信心）
- 所有提醒都可以 Override + 加註原因
- 每個提醒都有「為什麼」的解釋

## 功能

### 報價開立（事前賦能）

- 填寫現場條件 → 預算可行性快篩
- 選案件類型 → 一鍵帶入標準工項骨架（60+ 範本）
- 智慧表格編輯器（工種分區、inline editing、含/不含欄位）
- 即時風險提醒（右側面板，不打斷操作）
- Override 機制（覆寫 + 加註原因）
- 匯出報價單 PDF + 風險檢核報告

### 上傳檢查（事後審核）

- 上傳現有報價單 PDF
- Gemini 2.5 Flash AI 解析為結構化工項
- 自動跑風險檢查
- 可匯入到報價編輯器進一步調整
- 未分類工項自動收集，持續學習

### 風險檢核報告（給資深設計師）

- 系統已檢查的項目（70%）
- 設計師的 Override 覆寫紀錄
- 需要資深判斷的項目（30%）
- 資深只看這份，10 分鐘搞定

## 技術棧

| 層 | 技術 |
|----|------|
| Frontend | React + Vite + TanStack Router |
| UI | shadcn/ui + Tailwind CSS 4 |
| State | Zustand |
| 風險引擎 | Pure TypeScript（client-side, < 1ms） |
| PDF 產出 | @react-pdf/renderer |
| AI 解析 | Google Gemini 2.5 Flash |
| 部署 | Cloudflare Pages |

## 專案結構

```
q-check/
├── apps/web/                    # React 前端
│   └── src/
│       ├── pages/               # 頁面
│       │   ├── SiteConditionPage    # 現場條件 + 預算快篩
│       │   ├── QuotationPage        # 報價編輯器 + 風險面板
│       │   ├── UploadCheckPage      # 上傳 PDF 檢查
│       │   └── ExportPage           # 匯出報價單 + 風險報告
│       ├── components/          # UI 元件
│       ├── hooks/               # useRiskEngine
│       └── lib/                 # Gemini API, 工具函數
│
├── packages/
│   └── construction-knowledge/  # 工程知識庫（pure TS）
│       └── src/
│           ├── engine.ts        # 風險引擎（pure function）
│           ├── budget.ts        # 預算可行性計算
│           ├── rules/           # 25 條防呆規則
│           └── templates/       # 60+ 工項範本
│
├── specs/                       # 產品規格文件
│   └── 003-quotation-guardian/
│       ├── PRODUCT_BRIEF.md     # 產品定位 v3.0
│       ├── plan.md              # 技術架構計畫 v3.0
│       └── schema-design.md     # 資料庫設計 v3.0
│
└── data/                        # 13 份真實報價單 PDF 樣本
```

## 開發

```bash
# 安裝依賴
cd apps/web && bun install

# 開發
bun run dev

# 測試風險引擎
cd packages/construction-knowledge && bun test

# 建置
cd apps/web && bun run build

# 部署
bunx wrangler pages deploy apps/web/dist --project-name q-check-demo --commit-dirty=true
```

## 團隊

- **Stephen** — 技術創辦人
- **Vivian（賀云）** — 共同創辦人 / 設計師

## 產品路線圖

| 階段 | 內容 | 狀態 |
|------|------|:---:|
| MVP | 報價編輯器 + 風險引擎 + PDF 匯出 + 上傳檢查 | 完成 |
| Phase 2 | Auth + DB 持久化 + 資深覆核儀表板 | 規劃中 |
| Phase 3 | AI 擴充規則庫 + 多組織 + SaaS 化 | 規劃中 |

## License

Private — All rights reserved.
