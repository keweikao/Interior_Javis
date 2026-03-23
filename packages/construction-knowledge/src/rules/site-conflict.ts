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
];
