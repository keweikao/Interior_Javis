## 交接摘要 — 2026-03-24

### 本次目標
為 Q-Check（室內裝修公司風險管理決策系統）製作 15 分鐘的創業專題簡報，對象是業師（假想 VC）。

### 已完成
- **讀完所有 specs 文件**：PRODUCT_BRIEF、POCD、Lean Canvas、VPC、plan、CLASSIFICATION_RULES、schema-design、knowledge-base、designer-exploration-prompt 共 10 份
- **以 VC 視角做壓力測試**：列出 9 個業師會問的問題，Stephen 回答了 Q1-Q9，回答內容已融入簡報
- **故事線設計**：從 17 頁砍到 12 頁，加入 live demo 時間分配（4 分鐘）
- **PPT 版本產出**：`/scripts/generate-pitch-deck.py` → `Q-Check-Pitch-Deck.pptx`（12 頁，python-pptx，暖色室內設計風格）
- **網頁簡報版本**：`/pitch-deck/` 獨立 Vite + React + Tailwind + Framer Motion 專案
  - 12 張 slide，鍵盤/觸控/滾輪導航，stagger 動畫
  - Slide 5 VPC 用 tab 切換三角色，經典方形+圓形格式
  - Slide 8 競爭定位圖用 hover 互動卡片
  - 已加入 Vivian 和 Stephen 照片（Slide 10）
  - 已加入真實報價單截圖（Slide 2，模糊處理）
- **已部署**：https://q-check-pitch.pages.dev（Cloudflare Pages，不需登入）
- **競爭定位圖獨立版**：`Q-Check_競爭定位圖.pptx`（白底版，後來整合進主簡報改為深色）

### 未完成 / 卡住的地方
- **實測數據尚未取得**：覆核時間 30→10 分鐘目前是目標值，需 Vivian 實際跑案子量測
- **競品名稱待填**：NT$1,200/月那家（Slide 8 和 PPT 中標記為 `___（待填）`）
- **email 待確認**：目前用 `hello@qcheck.tw`，不確定是否已註冊
- **網頁版排版微調**：全螢幕下部分 slide 可能在不同解析度需要再調
- **PPT 版視覺品質有限**：python-pptx 能力受限，建議以網頁版為主

### 關鍵決策
| 決策點 | 選擇 | 原因 |
|--------|------|------|
| Override 用詞 | 改為「專業判斷」 | 中文觀眾聽不懂 Override，「專業判斷」精準描述設計師行使專業覆寫 |
| 導入策略 | 從 top-down 改為 PLG（Figma 式） | Stephen 認為應以設計師自己好用為切入，而非老闆強制導入 |
| 定價結構 | 三層：免費/進階 NT$990/企業另議 | 配合 PLG，低門檯讓設計師先用，分享同事時觸發付費 |
| 刪除 MRR 數字 | 改用每用戶平均營收呈現 | MRR 推估缺乏根據（990 vs 5000 矛盾），先不放具體數字 |
| 簡報格式 | 網頁版為主，PPT 為備份 | python-pptx 視覺受限，網頁可用動畫、互動、照片 |
| 市場頁刪競爭 | 競爭格局獨立成一頁（Slide 8） | 市場頁專注規模和時機，競爭用二維定位圖更有說服力 |
| 英文術語全改中文 | SaaS→訂閱制、TAM→總潛在市場 等 | 業師不一定熟悉英文縮寫 |
| 刪除無數據支撐的效益數字 | 只說「提升/下降」不說具體% | 沒跑過實測就不放數字，避免被業師追問 |

### 下一步
1. **請 Vivian 用系統跑一個真實案子**，量測覆核時間（before/after），填入 Slide 11 的實測數據欄
2. **確認 3-5 家願意 beta 的設計公司名單**，業師可能直接問「哪幾家？」
3. **填入競品名稱**（NT$1,200/月那家）到 Slide 8
4. **練習 live demo 流程**：預算快篩 → 骨架帶入 → 風險提醒 → 專業判斷 → 完成報告，控制在 4 分鐘內
5. **確認 demo URL 不需登入可正常操作**：https://q-check-demo.pages.dev
6. **網頁版排版微調**（如果在簡報用的螢幕上有溢出）

### 關鍵 Code / 設定 / 指令
```bash
# 網頁版開發
cd /Users/stephen/Interior_Javis/pitch-deck
bun run dev          # 開發模式
bun run build        # 打包

# 部署到 Cloudflare Pages
npx wrangler pages deploy dist --project-name=q-check-pitch --commit-dirty=true

# PPT 重新產出
python3 /Users/stephen/Interior_Javis/scripts/generate-pitch-deck.py
# 輸出：/Users/stephen/Interior_Javis/Q-Check-Pitch-Deck.pptx

# 修改 PPT 內容：編輯腳本頂部的變數區
MONTHLY_PRICE = "990"
COMPETITOR_NAME = "___（待填）"
DEMO_URL = "https://q-check-demo.pages.dev"
```

### 接續 Context
> 下次開新對話時，把以下這段完整貼給 Claude 就能接續：
>
> 我在做 Q-Check 的創業專題簡報，已經有兩個版本：
>
> **網頁版**（主要）：`/Users/stephen/Interior_Javis/pitch-deck/`，React + Vite + Tailwind 4 + Framer Motion，已部署到 https://q-check-pitch.pages.dev。12 張 slide，用暖色室內設計風格（炭棕底 #2B2522、黃銅金 accent #C49756）。導航用鍵盤箭頭/滾輪/觸控。Slide 5 VPC 有 tab 切換三角色，Slide 8 競爭圖有 hover 互動。
>
> **PPT 備份**：`/Users/stephen/Interior_Javis/scripts/generate-pitch-deck.py` 產出 `Q-Check-Pitch-Deck.pptx`，python-pptx 生成，12 頁，內容已同步網頁版。
>
> 關鍵產品決策：Override 改叫「專業判斷」、導入策略是 PLG（Figma 式，設計師先免費用→推同事→公司付費）、三層定價（免費/進階 990/企業另議）、沒有放未驗證的具體效益數字。
>
> 簡報內容在 `specs/003-quotation-guardian/` 下有完整的 PRODUCT_BRIEF、POCD、Lean Canvas、VPC 等文件。
>
> 待做：填入 Vivian 實測數據（覆核時間）、競品名稱、確認 beta 公司名單、練習 demo 流程。照片已放在 `pitch-deck/public/`（vivian.jpg, stephen.jpg, quotation-sample.png）。
