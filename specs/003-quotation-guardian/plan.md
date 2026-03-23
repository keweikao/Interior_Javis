# 技術架構計畫 — Q-Check

> **版本**: 3.0
> **日期**: 2026-03-23
> **技術棧**: Better-T Stack
> **定位**: 設計公司風險管理決策系統

---

## 一、技術棧選型（Better-T Stack）

```bash
bun create better-t-stack@latest q-check \
  --runtime bun \
  --frontend tanstack-router \
  --backend hono \
  --api trpc \
  --database postgres \
  --orm drizzle \
  --auth better-auth \
  --addons turborepo biome \
  --db-setup neon
```

### 選型理由

| 技術 | 選擇 | 理由 |
|------|------|------|
| **Runtime** | Bun | TypeScript 原生、啟動快、內建 test runner |
| **Frontend** | React + TanStack Router | 生態成熟、file-based routing、type-safe |
| **Backend** | Hono | 輕量、邊緣運算友好、middleware 生態豐富 |
| **API** | tRPC | 前後端 type-safe，報價資料結構複雜時很有價值 |
| **Database** | PostgreSQL (Neon) | 報價是結構化關聯資料、Neon serverless 免管 infra |
| **ORM** | Drizzle | 輕量、type-safe、SQL-like |
| **Auth** | Better-Auth | 內建、MVP 先用 email+password |
| **Monorepo** | Turborepo | 管理 web + server + shared packages |
| **Lint** | Biome | 快速 |

### 額外整合

| 需求 | 技術 | 說明 |
|------|------|------|
| **UI 元件** | shadcn/ui + Tailwind CSS 4 | 美觀、可客製 |
| **表格** | TanStack Table | 報價單編輯器核心（inline editing） |
| **PDF 產出** | @react-pdf/renderer | 產出格式化報價單 PDF |

### MVP 不需要的依賴

| 項目 | 原因 |
|------|------|
| xlsx (SheetJS) | 不需要解析 Excel |
| Google Gemini API | Phase 1 不做 AI |
| SSE / WebSocket | Client-side 引擎不需要 |

---

## 二、專案結構（Monorepo）

```
q-check/
├── .env
├── package.json
├── turbo.json
├── biome.json
│
├── apps/
│   └── web/
│       └── src/
│           ├── routes/
│           │   ├── __root.tsx
│           │   ├── index.tsx                    # Landing / Dashboard
│           │   ├── login.tsx
│           │   ├── projects/
│           │   │   ├── index.tsx                # 專案列表
│           │   │   └── $projectId/
│           │   │       ├── index.tsx            # 專案概覽 + 現場條件
│           │   │       ├── budget-check.tsx     # 🆕 Layer 0：預算可行性快篩
│           │   │       ├── quotation.tsx        # 🔑 Layer 1+2：報價編輯器 + 風險提醒
│           │   │       ├── report.tsx           # 🆕 Layer 3：完成報告（含風險摘要）
│           │   │       └── export.tsx           # PDF 預覽 & 匯出
│           │   └── settings.tsx
│           │
│           ├── components/
│           │   ├── quotation/
│           │   │   ├── QuotationEditor.tsx      # 🔑 智慧表格主元件
│           │   │   ├── ItemRow.tsx              # 工項行（inline editing + 含/不含欄位）
│           │   │   ├── CategorySection.tsx      # 工種分類區塊
│           │   │   ├── TemplateLibrary.tsx      # 工項範本庫側欄
│           │   │   ├── RiskAlertPanel.tsx       # 🆕 右側風險提醒面板（不打斷操作）
│           │   │   ├── OverrideDialog.tsx       # 🆕 Override 對話框（填寫覆寫原因）
│           │   │   └── CompletionReport.tsx     # 完成報告（含 Override 清單）
│           │   ├── project/
│           │   │   ├── SiteConditionForm.tsx    # 現場條件表單
│           │   │   ├── BudgetChecker.tsx        # 🆕 預算可行性快篩元件
│           │   │   └── ProjectCard.tsx
│           │   ├── export/
│           │   │   └── QuotationPDF.tsx         # PDF 報價單模板（含/不含寫明）
│           │   └── ui/                          # shadcn/ui
│           │
│           ├── hooks/
│           │   ├── useRiskEngine.ts             # 🔑 Client-side 風險引擎 hook
│           │   └── useQuotationStore.ts         # 報價單狀態管理
│           │
│           ├── lib/
│           │   ├── auth-client.ts
│           │   └── utils.ts
│           └── utils/
│               └── trpc.ts
│
├── server/
│   └── src/
│       ├── index.ts
│       └── services/
│           └── pdf-export.ts
│
├── packages/
│   ├── api/
│   │   └── src/
│   │       ├── index.ts
│   │       ├── context.ts
│   │       └── routers/
│   │           ├── index.ts
│   │           ├── project.ts         # 專案 CRUD + 現場條件 + 預算檢查
│   │           └── quotation.ts       # 報價單 CRUD + 工項 CRUD + Override 記錄
│   │
│   ├── auth/
│   │   └── src/
│   │       └── index.ts
│   │
│   ├── db/
│   │   └── src/
│   │       ├── index.ts
│   │       ├── seed.ts                # 工項範本 + 含/不含標準定義
│   │       └── schema/
│   │           ├── index.ts
│   │           ├── auth.ts
│   │           ├── project.ts         # 專案、現場條件（含預算）
│   │           ├── quotation.ts       # 報價單、工項（含 includes/excludes、override）
│   │           └── template.ts        # 工項範本（含標準含/不含定義）
│   │
│   ├── env/
│   │   └── src/
│   │       ├── server.ts
│   │       └── web.ts
│   │
│   ├── config/
│   │   └── tsconfig.base.json
│   │
│   └── construction-knowledge/        # 🔑 風險知識庫（前後端共用 pure TS）
│       ├── package.json
│       └── src/
│           ├── index.ts
│           ├── types.ts               # Rule, RiskAlert, Override 等型別
│           ├── engine.ts              # 🔑 風險引擎核心（pure function）
│           ├── budget.ts              # 🆕 預算可行性計算（Layer 0）
│           ├── rules/
│           │   ├── dependency.ts      # 漏項規則（工序連動）
│           │   ├── site-conflict.ts   # 現場衝突規則
│           │   ├── quantity.ts        # 數量異常規則
│           │   ├── clarity.ts         # 🆕 描述清晰度規則（認知落差）
│           │   └── pricing.ts         # 🆕 單價行情規則
│           ├── templates/
│           │   ├── demolition.ts
│           │   ├── plumbing.ts
│           │   ├── masonry.ts
│           │   ├── carpentry.ts
│           │   ├── painting.ts
│           │   └── index.ts
│           └── explanations.ts        # 每條規則的「為什麼」解釋
```

---

## 三、核心資料流（四層架構）

```
┌───────────────────────────────────────────────────────────────────┐
│  設計師操作流程                                                    │
│                                                                   │
│  1. 建專案    2. 填現場條件     3. 預算快篩      4. 開報價單        │
│     + 預算                                                        │
└────┬──────────────┬──────────────┬────────────────┬───────────────┘
     │              │              │                │
     ▼              ▼              ▼                ▼
┌─────────┐  ┌───────────┐  ┌──────────────┐  ┌──────────────────┐
│ project │  │   site    │  │ budget.ts    │  │ QuotationEditor  │
│ → DB    │  │ condition │  │ (pure func)  │  │ (TanStack Table) │
│         │  │ → DB      │  │              │  │                  │
│         │  │ + 預算     │  │ 輸出：        │  │ 骨架帶入 → 刪改  │
└─────────┘  └─────┬─────┘  │ ⚠️ 預算不合理 │  └───────┬──────────┘
                   │        │ ✅ 預算合理    │          │
                   │        └──────────────┘          │
                   │                                   │
                   │     每次工項 增/刪/改/Override      │
                   │              │                    │
                   ▼              ▼                    │
            ┌────────────────────────────┐             │
            │  useRiskEngine (Hook)      │             │
            │  engine.ts (pure function) │             │
            │                            │             │
            │  輸入：                     │             │
            │  • items + includes/excludes│             │
            │  • siteCondition + budget  │             │
            │  • rules (5 categories)    │             │
            │                            │             │
            │  輸出：                     │             │
            │  • riskAlerts[]            │             │
            │  • clarityWarnings[]  🆕   │             │
            │  • overrideSummary[]  🆕   │             │
            └──────────┬─────────────────┘             │
                       │                               │
                       ▼                               │
            ┌──────────────────────┐                   │
            │  RiskAlertPanel      │                   │
            │  （右側，不打斷操作）  │                   │
            │                      │                   │
            │  🔴 漏項             │                   │
            │  🟡 描述模糊         │                   │
            │  🟡 數量異常         │                   │
            │  💰 單價偏低         │                   │
            │                      │                   │
            │  每個提醒：           │                   │
            │  [接受] [Override]   │───────────────────┘
            │         ↓            │
            │  OverrideDialog      │
            │  「填寫覆寫原因」     │
            └──────────┬───────────┘
                       │
                       ▼
            ┌──────────────────────────────┐
            │  CompletionReport            │
            │                              │
            │  📋 Checklist 確認            │
            │  📊 風險摘要（含 Override 清單）│
            │  📄 PDF 報價單匯出            │
            │     （含/不含欄位寫明）        │
            │  📊 內部風險報告（不給客戶）    │
            └──────────────────────────────┘
```

---

## 四、核心元件設計

### 4.1 風險引擎（`construction-knowledge/engine.ts`）

**設計原則**：Pure function、無 side effect、前後端共用、100% 可測試

```typescript
// 引擎 API 簡述

interface RiskEngineInput {
  items: QuotationItem[];           // 含 includes/excludes
  siteCondition: SiteCondition;     // 含 budget
  rules: RiskRule[];
  overrides: Override[];            // 已 override 的提醒
}

interface RiskAlert {
  id: string;
  severity: "critical" | "warning" | "info";
  category: "dependency" | "site_conflict" | "quantity" | "clarity" | "pricing";
  title: string;
  why: string;                      // 培養底氣的關鍵
  suggestion: string;
  relatedItemIds: string[];
  suggestedItem?: TemplateItem;
  canOverride: boolean;             // critical 級別不可 override
}

interface Override {
  alertId: string;
  reason: string;                   // 設計師填寫的覆寫原因
  overriddenBy: string;             // user id
  overriddenAt: Date;
}

// Pure function
function runRiskEngine(input: RiskEngineInput): {
  alerts: RiskAlert[];              // 風險提醒
  clarityWarnings: RiskAlert[];     // 描述清晰度警告
  checklist: ChecklistItem[];       // 動態 checklist
  overrideSummary: Override[];      // Override 摘要（供資深覆核）
};
```

### 4.2 預算可行性快篩（`construction-knowledge/budget.ts`）

```typescript
interface BudgetCheckInput {
  totalArea: number;               // 坪數
  buildingType: string;            // 新成屋/中古屋/老屋
  buildingAge: number;             // 屋齡
  scope: string[];                 // 要做的工種大類
  clientBudget: number;            // 客戶預算
}

interface BudgetCheckResult {
  feasible: boolean;
  estimatedRange: { min: number; max: number };
  gap: number | null;              // 預算缺口
  message: string;                 // 人類可讀的建議
  riskLevel: "safe" | "tight" | "unrealistic";
}

function checkBudgetFeasibility(input: BudgetCheckInput): BudgetCheckResult;
```

### 4.3 風險提醒面板（`RiskAlertPanel.tsx`）

- **位置**：編輯器右側（不打斷操作）
- **分層顯示**：
  - 🔴 Critical：紅色卡片，置頂，不可 Override
  - 🟡 Warning：黃色卡片，可 Override
  - 🔵 Info：收合，點開才看
- 每張卡片包含：標題 + 「為什麼」+ 建議 + [接受] / [Override] 按鈕

### 4.4 Override 對話框（`OverrideDialog.tsx`）

- 點擊 Override 後彈出
- 必填：覆寫原因（一句話）
- 選填：備註
- 送出後：該提醒標記為已覆寫，不再重複顯示
- 所有 Override 記錄彙整到完成報告

### 4.5 工項行（`ItemRow.tsx`）

每個工項行包含：
- 工種分類 | 工項名稱 | 單位 | 數量 | 單價 | 小計
- 規格說明（展開欄）
- **含/不含**（展開欄）— 解決認知落差的核心
  - ✅ 含：五金安裝、表面處理
  - ❌ 不含：特殊五金、玻璃
- 備註

---

## 五、開發階段

### Phase 1：骨架 + 預算快篩（第 1 週）

- [ ] 用 Better-T Stack CLI 產生專案
- [ ] 設定 Neon PostgreSQL
- [ ] 建立 Drizzle schema 並 migrate
- [ ] Better-Auth 設定（email + password）
- [ ] 基本 CRUD：專案、現場條件（含預算）
- [ ] `budget.ts` 預算可行性計算
- [ ] `BudgetChecker.tsx` 預算快篩頁面

### Phase 2：報價編輯器 + 風險引擎（第 2-3 週）

- [ ] `construction-knowledge` package
  - [ ] 萃取防呆規則（含漏項、描述清晰度、數量、現場衝突、單價）
  - [ ] 每條規則加上「為什麼」解釋
  - [ ] 風險引擎 pure function
  - [ ] 單元測試
- [ ] 工項範本庫（含標準「含/不含」定義）
- [ ] 報價單智慧表格編輯器
  - [ ] TanStack Table + inline editing
  - [ ] 含/不含欄位
  - [ ] 工種分類分區顯示
  - [ ] 骨架帶入（選案件類型 + 勾工種 → 一次帶入）
- [ ] `RiskAlertPanel.tsx` 右側風險面板
- [ ] `OverrideDialog.tsx` Override 機制
- [ ] `useRiskEngine` hook

### Phase 3：完成報告 + PDF 輸出（第 3-4 週）

- [ ] 完成報告頁面
  - [ ] Checklist 確認
  - [ ] 風險摘要（含 Override 清單）
  - [ ] 內部風險報告
- [ ] PDF 報價單匯出
  - [ ] 含/不含欄位寫明
  - [ ] 排版格式

### Phase 4：閉門測試（第 4-5 週）

- [ ] 用歷史案例手動輸入測試
- [ ] 調教規則閾值 + 預算公式
- [ ] 修正 false positive / false negative
- [ ] 與合作方設計師實際試用

---

## 六、部署方案

| 元件 | 平台 | 說明 |
|------|------|------|
| Web 前端 | Vercel | React SPA |
| API 後端 | Vercel Serverless / Railway | Hono |
| Database | Neon PostgreSQL | Serverless |

---

## 七、未來擴展（正確路徑）

```
Phase 1 (MVP): 結構化報價系統（不做 AI）
    → 用戶使用自然產生乾淨資料
               ↓
Phase 2: AI 整理舊資料，擴充工項與漏項庫
               ↓
Phase 3: AI 風險預測與報價建議
```

| 功能 | 優先級 | 階段 |
|------|:---:|:---:|
| 資深覆核儀表板（只看 30% 清單） | P1 | Post-MVP |
| 老手回饋迴路（✅❌✏️） | P1 | Post-MVP |
| 多組織/團隊管理 | P1 | SaaS 化 |
| AI 整理舊報價資料 | P2 | Phase 2 |
| 規則管理後台 | P2 | Phase 2 |
| AI 風險預測 | P3 | Phase 3 |
| 上傳舊報價單審核 | P3 | Phase 3 |
| 同業比價/市場行情 | P3 | Phase 3 |
