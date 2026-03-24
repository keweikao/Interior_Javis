import type { SiteConflictRule } from "../types.js";

export const siteConflictRules: SiteConflictRule[] = [
  {
    id: "site-001",
    severity: "warning",
    title: "高樓層無電梯，大型建材需搬運費/吊車",
    why: "無電梯且3樓以上搬運大型建材（大板磚、浴缸、大理石等）需額外人力或吊車費用",
    suggestion: "請確認是否需新增吊車費或特殊搬運費",
    check: (items, site) => {
      if (site.hasElevator || site.floorLevel < 3) return false;
      const heavyKeywords = ["大板磚", "浴缸", "大理石", "石材", "鋼琴"];
      return items.some((item) =>
        heavyKeywords.some((kw) => item.itemName.includes(kw)),
      );
    },
  },
  {
    id: "site-002",
    severity: "warning",
    title: "施工期間有人住，缺少保護工程",
    why: "施工中有人居住需臨時隔間保護、工時限制及噪音管控，保護工程不可省略",
    suggestion: "請新增施工中居住保護措施（臨時隔間、家具覆蓋、地板保護）",
    check: (items, site) => {
      if (site.buildingType !== "partial") return false;
      const hasProtection = items.some(
        (item) =>
          item.category === "protection" ||
          item.itemName.includes("保護"),
      );
      return !hasProtection;
    },
  },
  {
    id: "site-003",
    severity: "warning",
    title: "老屋20年以上水電工程建議全面更新",
    why: "屋齡超過20年的水電管線老化，局部更新可能導致新舊管線接合問題，建議全面更新",
    suggestion: "建議將水電工程升級為全面更新（全室電線重拉、給水管全面更換）",
    check: (items, site) => {
      if (site.buildingAge < 20) return false;
      const hasPlumbing = items.some((item) => item.category === "plumbing");
      if (!hasPlumbing) return false;
      const hasFullRewire = items.some(
        (item) =>
          item.itemName.includes("全面更新") ||
          item.itemName.includes("全室") ||
          item.itemName.includes("重拉"),
      );
      return !hasFullRewire;
    },
  },
  {
    id: "site-004",
    severity: "warning",
    title: "無停車空間，搬運費用可能增加",
    why: "無停車空間時建材卸貨距離增加，搬運費用需另計，大型工程可能需申請臨時停車許可",
    suggestion: "請確認搬運費是否已包含步行距離加價，必要時申請臨時停車許可",
    check: (_items, site) => {
      // Trigger for buildings without elevator on higher floors as proxy for no parking
      return !site.hasElevator && site.floorLevel >= 4;
    },
  },
  {
    id: "site-005",
    severity: "warning",
    title: "挑高空間油漆/天花板需鷹架費用",
    why: "樓高超過300cm時油漆及天花板工程需使用鷹架或高空作業車，費用另計",
    suggestion: "請新增鷹架費用或高空作業費",
    check: (items, _site) => {
      // Check if any item mentions high ceiling related work
      const hasCeilingOrPaint = items.some(
        (item) =>
          item.category === "painting" || item.category === "carpentry",
      );
      const mentionsHighCeiling = items.some(
        (item) =>
          item.itemName.includes("挑高") || item.specification?.includes("挑高"),
      );
      const hasScaffolding = items.some(
        (item) =>
          item.itemName.includes("鷹架") || item.itemName.includes("高空作業"),
      );
      return hasCeilingOrPaint && mentionsHighCeiling && !hasScaffolding;
    },
  },
  // ── 專櫃：百貨施工時段 ──
  {
    id: "site-retail-001",
    severity: "warning",
    title: "專櫃施工需確認百貨夜間施工加價",
    why: "百貨施工通常限閉店後夜間進行，夜間人工成本加 30-50%，未計入會造成嚴重虧損",
    suggestion: "請確認百貨施工時段，並將夜間施工加價（約 30-50%）納入報價",
    check: (_items, site) => {
      return site.buildingType === "retail";
    },
  },
  // ── 餐廳：排煙管道 ──
  {
    id: "site-rest-001",
    severity: "warning",
    title: "餐廳需確認排煙管道路徑及大樓共用管道容量",
    why: "排油煙管需連接至大樓排煙系統，管道路徑受限或共用管道容量不足會導致排煙效果差，營業後才發現成本極高",
    suggestion: "施工前請確認大樓排煙管道位置、可用容量及管路距離",
    check: (_items, site) => {
      return site.buildingType === "restaurant";
    },
  },
  // ── 毛胚屋：全室基礎內裝 ──
  {
    id: "site-raw-001",
    severity: "warning",
    title: "毛胚屋需大量泥作及油漆預算",
    why: "毛胚屋牆面地面皆未整平粉光，全室泥作（整平/粉光）+ 油漆（批土/底漆/面漆）為最大宗基礎工程，常被低估",
    suggestion: "請確認泥作及油漆工項已涵蓋全室面積，毛胚屋此兩項通常佔總預算 25-35%",
    check: (items, site) => {
      if (site.buildingType !== "raw") return false;
      const hasMasonry = items.some((item) => item.category === "masonry");
      const hasPainting = items.some((item) => item.category === "painting");
      return !hasMasonry || !hasPainting;
    },
  },
  // ── 辦公大樓：管委會 ──
  {
    id: "site-office-001",
    severity: "warning",
    title: "辦公大樓施工需提前申請管委會許可",
    why: "商辦大樓通常有施工時段限制、貨梯預約、保證金等要求，未提前申請會延誤開工",
    suggestion: "請確認大樓管委會施工申請流程、施工時段限制及保證金金額",
    check: (_items, site) => {
      return site.buildingType === "office";
    },
  },
];
