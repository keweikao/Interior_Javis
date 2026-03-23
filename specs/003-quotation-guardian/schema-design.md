# Drizzle Schema 設計 — Q-Check

> **版本**: 3.0
> **日期**: 2026-03-23
> **定位**: 設計公司風險管理決策系統

---

## 資料模型總覽

```
User (Better-Auth 管理)
 └─ Project (專案/案場)
     ├─ SiteCondition (現場條件 + 預算)
     └─ Quotation (報價單)
         ├─ QuotationItem (報價工項 + 含/不含 + Override)
         └─ QuotationOverride (Override 記錄)

ItemTemplate (工項範本 + 標準含/不含定義)
```

---

## Schema 定義（Drizzle TypeScript）

```typescript
// ============================================
// schema.ts - Drizzle ORM Schema (MVP v3)
// ============================================

import { pgTable, text, integer, boolean, timestamp, real,
         pgEnum, jsonb, uuid } from "drizzle-orm/pg-core";

// ---- Enums ----

export const quotationStatusEnum = pgEnum("quotation_status", [
  "draft",        // 編輯中
  "confirmed",    // 已確認（checklist 通過）
  "exported"      // 已匯出 PDF
]);

export const tradeCategoryEnum = pgEnum("trade_category", [
  "protection",     // 保護工程
  "demolition",     // 拆除工程
  "plumbing",       // 水電工程
  "masonry",        // 泥作工程
  "waterproofing",  // 防水工程
  "carpentry",      // 木作工程
  "painting",       // 油漆工程
  "flooring",       // 地板工程
  "ceiling",        // 天花板工程
  "cabinet",        // 系統櫃/廚具
  "hvac",           // 空調設備
  "window_door",    // 門窗工程
  "cleaning",       // 清潔工程
  "transport",      // 搬運工程
  "other"           // 其他
]);

export const budgetRiskEnum = pgEnum("budget_risk", [
  "safe",           // 預算充足
  "tight",          // 預算偏緊
  "unrealistic"     // 預算不合理
]);

// ---- Project (專案/案場) ----

export const project = pgTable("project", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull(),
  name: text("name").notNull(),                // 案場名稱
  address: text("address"),
  description: text("description"),

  // 案件類型（用於骨架帶入）
  projectType: text("project_type"),           // "new_build" | "mid_age" | "old_renovation" | "partial"

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ---- Site Condition (現場條件 + 預算) ----

export const siteCondition = pgTable("site_condition", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id").references(() => project.id, { onDelete: "cascade" }).notNull().unique(),

  // 基本資訊
  totalArea: real("total_area"),                    // 室內總坪數
  floorLevel: integer("floor_level"),               // 樓層
  hasElevator: boolean("has_elevator"),              // 有無電梯
  buildingType: text("building_type"),               // "apartment" | "townhouse" | "highrise" | "old_building"
  buildingAge: integer("building_age"),              // 屋齡（年）
  ceilingHeight: real("ceiling_height"),             // 天花板高度（cm）

  // 預算（Layer 0 快篩用）
  clientBudget: real("client_budget"),               // 客戶預算（含設計費）
  budgetRisk: budgetRiskEnum("budget_risk"),          // 預算風險評估結果
  budgetNote: text("budget_note"),                    // 預算評估說明

  // 特殊條件
  hasMoistureIssue: boolean("has_moisture_issue").default(false),
  hasLeakIssue: boolean("has_leak_issue").default(false),
  isOccupied: boolean("is_occupied").default(false),
  hasParking: boolean("has_parking").default(true),
  specialNotes: text("special_notes"),

  // 格局
  rooms: jsonb("rooms"),  // [{ type: "living", area: 8 }, ...]

  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ---- Quotation (報價單) ----

export const quotation = pgTable("quotation", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id").references(() => project.id, { onDelete: "cascade" }).notNull(),
  status: quotationStatusEnum("status").default("draft").notNull(),
  name: text("name"),                              // 報價單名稱
  version: integer("version").default(1),          // 版本號
  totalAmount: real("total_amount"),
  itemCount: integer("item_count").default(0),

  // 完成確認
  checklistConfirmedAt: timestamp("checklist_confirmed_at"),
  checklistData: jsonb("checklist_data"),

  // 風險摘要快照
  riskSummary: jsonb("risk_summary"),              // { criticalCount, warningCount, overrideCount, ... }

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ---- Quotation Item (報價工項) ----

export const quotationItem = pgTable("quotation_item", {
  id: uuid("id").defaultRandom().primaryKey(),
  quotationId: uuid("quotation_id").references(() => quotation.id, { onDelete: "cascade" }).notNull(),

  // 工項資訊
  category: tradeCategoryEnum("category"),
  itemName: text("item_name").notNull(),
  unit: text("unit"),
  quantity: real("quantity"),
  unitPrice: real("unit_price"),
  totalPrice: real("total_price"),
  specification: text("specification"),              // 規格說明
  notes: text("notes"),

  // 含/不含（解決認知落差 #1 痛點）
  includes: text("includes"),                        // 此工項包含的內容
  excludes: text("excludes"),                        // 此工項不包含的內容

  // 來源與排序
  fromTemplateId: uuid("from_template_id"),
  sortOrder: integer("sort_order").default(0),
});

// ---- Quotation Override (Override 記錄) ----

export const quotationOverride = pgTable("quotation_override", {
  id: uuid("id").defaultRandom().primaryKey(),
  quotationId: uuid("quotation_id").references(() => quotation.id, { onDelete: "cascade" }).notNull(),

  // Override 資訊
  ruleId: text("rule_id").notNull(),                 // 被 override 的規則 ID
  alertTitle: text("alert_title").notNull(),          // 原始提醒標題（快照）
  reason: text("reason").notNull(),                   // 設計師填寫的覆寫原因
  relatedItemIds: jsonb("related_item_ids"),           // 相關工項 ID

  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ---- Item Template (工項範本) ----

export const itemTemplate = pgTable("item_template", {
  id: uuid("id").defaultRandom().primaryKey(),
  category: tradeCategoryEnum("category").notNull(),
  itemName: text("item_name").notNull(),
  unit: text("unit"),
  description: text("description"),
  commonlyMissed: boolean("commonly_missed").default(false),

  // 標準含/不含定義（解決認知落差）
  defaultIncludes: text("default_includes"),          // 預設「含」的內容
  defaultExcludes: text("default_excludes"),          // 預設「不含」的內容

  // 適用案件類型（骨架帶入用）
  applicableTypes: jsonb("applicable_types"),          // ["new_build", "mid_age", "old_renovation"]

  sortOrder: integer("sort_order").default(0),
});
```

---

## 關聯圖 (ER Diagram)

```
┌──────────────┐
│   user       │ (Better-Auth)
└──────┬───────┘
       │ 1:N
       ▼
┌──────────────┐     ┌───────────────────────┐
│   project    │────►│  siteCondition        │  (1:1)
│  + type      │     │  + budget             │
└──────┬───────┘     │  + budgetRisk         │
       │             └───────────────────────┘
       │ 1:N
       ▼
┌──────────────┐
│  quotation   │
│  + version   │
│  + riskSumm  │
└──────┬───────┘
       │
       ├─── 1:N ──►┌──────────────────────┐
       │            │  quotationItem       │
       │            │  + includes/excludes │ ← 解決認知落差
       │            └──────────────────────┘
       │
       └─── 1:N ──►┌──────────────────────┐
                    │  quotationOverride   │ ← Override 記錄
                    │  + ruleId            │
                    │  + reason            │
                    └──────────────────────┘

┌──────────────────────────┐
│  itemTemplate            │  (全域)
│  + defaultIncludes       │
│  + defaultExcludes       │
│  + applicableTypes       │
└──────────────────────────┘
```

---

## 種子資料範例

```typescript
const seedTemplates = [
  // === 保護工程 ===
  {
    category: "protection",
    itemName: "電梯保護",
    unit: "式",
    description: "大樓施工必備",
    defaultIncludes: "電梯內壁保護板、地面保護",
    defaultExcludes: "電梯外部、大廳保護",
    applicableTypes: ["new_build", "mid_age", "old_renovation"],
  },

  // === 拆除工程 ===
  {
    category: "demolition",
    itemName: "垃圾清運",
    unit: "車",
    description: "最常被漏報的項目",
    defaultIncludes: "裝袋、搬運至車上、運棄",
    defaultExcludes: "特殊廢棄物（石綿、化學品）處理",
    commonlyMissed: true,
    applicableTypes: ["mid_age", "old_renovation"],
  },

  // === 木作工程 ===
  {
    category: "carpentry",
    itemName: "木作櫃體",
    unit: "尺",
    description: "含木心板+表面貼皮",
    defaultIncludes: "櫃體結構、層板、表面處理、基本五金（鉸鏈）",
    defaultExcludes: "特殊五金、玻璃門片、燈條、抽屜滑軌升級",
    applicableTypes: ["new_build", "mid_age", "old_renovation"],
  },

  // === 油漆工程 ===
  {
    category: "painting",
    itemName: "油漆工程（全室）",
    unit: "坪",
    description: "含批土+底漆+面漆",
    defaultIncludes: "批土整平（一般狀況）、底漆一道、面漆兩道",
    defaultExcludes: "壁癌處理、大面積裂縫修補、特殊塗料（珪藻土、礦物漆）",
    applicableTypes: ["new_build", "mid_age", "old_renovation"],
  },

  // ... 更多工項
];
```

---

## v3.0 新增欄位摘要

| 表 | 新增欄位 | 用途 |
|---|---------|------|
| `project` | `projectType` | 骨架帶入的依據 |
| `siteCondition` | `clientBudget`, `budgetRisk`, `budgetNote` | Layer 0 預算快篩 |
| `quotation` | `version`, `riskSummary` | 版本管理 + 風險快照 |
| `quotationItem` | `includes`, `excludes` | 解決認知落差 #1 痛點 |
| `quotationOverride` | （新表） | Override 記錄 |
| `itemTemplate` | `defaultIncludes`, `defaultExcludes`, `applicableTypes` | 標準定義 + 骨架帶入 |

---

## Post-MVP 擴展預留

| 表 | 用途 | 加回時機 |
|---|------|---------|
| `organization` | 多租戶/團隊 | SaaS 化 |
| `user_profile` | 經驗年數、角色（資深/年輕） | 資深覆核儀表板 |
| `review_request` | 資深覆核請求 | 覆核流程 |
| `feedback` | 老手回饋 | 回饋迴路 |
| `rule` | DB 管理的風險規則 | 規則管理後台 |
