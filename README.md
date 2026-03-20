# Interior Javis — 裝修報價防呆守衛

Interior Javis 是一個 B2B 的「裝修報價單防呆助理」，為室內設計公司和統包商在發包前，自動揪出報價單中會導致**現場停工、做錯重來、嚴重漏項**的致命錯誤。

> 把資深老手的經驗變成自動化流程，讓年輕設計師也能發出零失誤的清單。

## 核心功能 — 三大防呆關卡

| 關卡 | 功能 | 範例 |
|------|------|------|
| **漏項檢查** | 工序相依性驗證 — 有 A 工項就必須有 B | 報價有「全熱交換器」→ 自動檢查有沒有報「洗洞」 |
| **衝突檢查** | 現場條件 × 建材/工法限制矩陣 | 「無電梯 5 樓」+「240cm 大板磚」→ 缺少「吊車費」 |
| **數量異常** | 坪數與工項數量的經驗比例檢查 | 室內 20 坪，油漆只報 25 坪（正常應約 60 坪） |

## 使用流程

1. **輸入** — 填寫現場條件（樓層、坪數、格局等）+ 上傳報價單（Excel）
2. **審核** — 系統自動執行三大防呆關卡
3. **報告** — 產出紅黃綠燈防呆報告 + 具體修正建議
4. **學習** — 老手透過回饋（確認/否決/調整）持續訓練系統

## 技術架構

**規則引擎優先，AI 輔助** — 確定性邏輯用規則引擎處理，模糊判斷與建議生成交由 AI。

### 目標技術棧（Better-T Stack）

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

### 現有原型（Python）

專案包含早期驗證階段的 Python 原型：

- **`analysis-service/`** — FastAPI 後端，含多 Agent 系統（客戶經理、統包商、設計師）
- **`web-service/`** — React (Vite) 前端，含對話式 UI、報價結果展示
- **`background-processor/`** — 背景任務處理
- **`tools/`** — GCP 整合工具（BigQuery、Firestore、GCS、Slack 等）

## 專案結構

```
Interior_Javis/
├── analysis-service/     # Python FastAPI 後端（原型）
├── web-service/          # React 前端（原型）
├── background-processor/ # 背景處理器
├── specs/                # 產品規格文件
│   ├── 002-interior-deco-ai/   # 舊版規格（參考用）
│   └── 003-quotation-guardian/  # 報價防呆守衛規格
├── tools/                # GCP 整合工具
├── docs/                 # 開發文件
├── scripts/              # 自動化腳本
└── templates/            # 專案模板
```

## 快速開始

### 後端

```bash
cd analysis-service
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn src.main:app --reload
```

### 前端

```bash
cd web-service
npm install
npm run dev
```

開啟瀏覽器前往 `http://127.0.0.1:5173` 查看應用程式。

## 目標用戶

| 角色 | 痛點 | 使用場景 |
|------|------|----------|
| 室內設計公司 | 年輕設計師經驗不足，漏項導致追加 | 出圖前的必經關卡 |
| 小型統包商 | 沒有資深工程師覆核 | 發包前自我檢查 |
| 工程顧問 | 人工審圖耗時、易疏漏 | 批量審核多份報價單 |

## 商業願景

短期內部省錢避險 → 中期包裝為 SaaS 訂閱服務 → 長期建立業界發包標準

## License

Private — All rights reserved.
