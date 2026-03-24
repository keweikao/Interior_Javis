import type { QuantityRule } from "../types.js";

export const quantityRules: QuantityRule[] = [
  {
    id: "qty-001",
    severity: "warning",
    title: "油漆面積與總坪數比例異常",
    why: "油漆面積（含牆面+天花板）通常為地坪面積的2.5-4.0倍，比例過低可能漏算天花板或部分牆面",
    suggestion: "請確認油漆面積是否包含天花板及全部牆面，合理比例為總坪數的2.5-4.0倍",
    check: (items, site) => {
      const paintItems = items.filter(
        (item) =>
          item.category === "painting" &&
          (item.itemName.includes("油漆") ||
            item.itemName.includes("面漆") ||
            item.itemName.includes("乳膠漆")),
      );
      if (paintItems.length === 0) return { triggered: false, relatedItemIds: [] };

      const totalPaintArea = paintItems.reduce(
        (sum, item) => sum + (item.quantity ?? 0),
        0,
      );
      if (totalPaintArea === 0) return { triggered: false, relatedItemIds: [] };

      const ratio = totalPaintArea / site.totalArea;
      if (ratio < 2.0 || ratio > 5.0) {
        return {
          triggered: true,
          relatedItemIds: paintItems.map((item) => item.id),
        };
      }
      return { triggered: false, relatedItemIds: [] };
    },
  },
  {
    id: "qty-002",
    severity: "warning",
    title: "清運車數與拆除面積不符",
    why: "全室拆除約每10坪需要2車清運，車數過少可能導致廢料堆積影響施工",
    suggestion: "請確認清運車數是否足夠，全室拆除建議每10坪至少2車",
    check: (items, site) => {
      const demolitionItems = items.filter(
        (item) => item.category === "demolition" && !item.itemName.includes("清運"),
      );
      if (demolitionItems.length === 0)
        return { triggered: false, relatedItemIds: [] };

      const transportItems = items.filter(
        (item) =>
          item.itemName.includes("清運") || item.itemName.includes("垃圾"),
      );
      if (transportItems.length === 0)
        return { triggered: false, relatedItemIds: [] };

      const totalTrucks = transportItems.reduce(
        (sum, item) => sum + (item.quantity ?? 0),
        0,
      );

      // 數量為 0 表示尚未填寫，不觸發
      if (totalTrucks === 0) return { triggered: false, relatedItemIds: [] };

      const expectedMinTrucks = Math.ceil((site.totalArea / 10) * 2) * 0.5;

      if (totalTrucks < expectedMinTrucks) {
        return {
          triggered: true,
          relatedItemIds: transportItems.map((item) => item.id),
        };
      }
      return { triggered: false, relatedItemIds: [] };
    },
  },
  {
    id: "qty-003",
    severity: "warning",
    title: "電迴路數與總坪數不符",
    why: "20坪以上住家基本需要8迴路以上（含廚房2-3迴路、冷氣每台1迴路），迴路數過少可能導致跳電",
    suggestion: "請確認電迴路數是否足夠，20坪以上建議至少8迴路",
    check: (items, site) => {
      if (site.totalArea < 20) return { triggered: false, relatedItemIds: [] };

      const circuitItems = items.filter(
        (item) =>
          item.category === "plumbing" &&
          (item.itemName.includes("迴路") || item.itemName.includes("回路")),
      );
      if (circuitItems.length === 0)
        return { triggered: false, relatedItemIds: [] };

      const totalCircuits = circuitItems.reduce(
        (sum, item) => sum + (item.quantity ?? 0),
        0,
      );

      // 數量為 0 表示尚未填寫，不觸發
      if (totalCircuits === 0) return { triggered: false, relatedItemIds: [] };

      if (totalCircuits < 8) {
        return {
          triggered: true,
          relatedItemIds: circuitItems.map((item) => item.id),
        };
      }
      return { triggered: false, relatedItemIds: [] };
    },
  },
  {
    id: "qty-004",
    severity: "warning",
    title: "開關插座數量與總坪數不符",
    why: "每坪建議2-3個開關插座（含既有），低於每坪1個明顯不足，日後可能需要拉延長線",
    suggestion: "請確認開關插座數量，建議每坪至少2個",
    check: (items, site) => {
      const socketItems = items.filter(
        (item) =>
          item.category === "plumbing" &&
          (item.itemName.includes("插座") || item.itemName.includes("開關")),
      );
      if (socketItems.length === 0)
        return { triggered: false, relatedItemIds: [] };

      const totalSockets = socketItems.reduce(
        (sum, item) => sum + (item.quantity ?? 0),
        0,
      );

      // 數量為 0 表示尚未填寫，不觸發
      if (totalSockets === 0) return { triggered: false, relatedItemIds: [] };

      if (totalSockets < site.totalArea) {
        return {
          triggered: true,
          relatedItemIds: socketItems.map((item) => item.id),
        };
      }
      return { triggered: false, relatedItemIds: [] };
    },
  },
  {
    id: "qty-005",
    severity: "warning",
    title: "防水面積可能不足",
    why: "浴室防水應全間施作，地面全做加牆面淋浴區至少180cm高，面積不足可能留下漏水隱患",
    suggestion: "請確認防水面積是否涵蓋全部浴室地面及淋浴區牆面",
    check: (items, _site) => {
      const waterproofItems = items.filter(
        (item) =>
          item.category === "waterproofing" &&
          item.itemName.includes("防水") &&
          item.unit === "間",
      );
      const bathroomDemoItems = items.filter(
        (item) =>
          item.itemName.includes("浴室") && item.itemName.includes("拆除"),
      );

      if (waterproofItems.length === 0 || bathroomDemoItems.length === 0) {
        return { triggered: false, relatedItemIds: [] };
      }

      const waterproofCount = waterproofItems.reduce(
        (sum, item) => sum + (item.quantity ?? 0),
        0,
      );
      const bathroomCount = bathroomDemoItems.reduce(
        (sum, item) => sum + (item.quantity ?? 0),
        0,
      );

      if (waterproofCount < bathroomCount) {
        return {
          triggered: true,
          relatedItemIds: waterproofItems.map((item) => item.id),
        };
      }
      return { triggered: false, relatedItemIds: [] };
    },
  },
  // ── 餐廳：廚房迴路數 ──
  {
    id: "qty-rest-001",
    severity: "warning",
    title: "餐廳廚房電迴路數可能不足",
    why: "商業廚房設備（烤箱、炸爐、冷藏設備等）用電量大，至少需 3 組獨立迴路，否則同時啟動會跳電",
    suggestion: "請確認廚房獨立迴路數至少 3 組（大型設備各 1 迴路），並與一般照明迴路分開",
    check: (items, site) => {
      if (site.buildingType !== "restaurant") return { triggered: false, relatedItemIds: [] };

      const circuitItems = items.filter(
        (item) =>
          item.category === "plumbing" &&
          (item.itemName.includes("迴路") || item.itemName.includes("回路")),
      );
      if (circuitItems.length === 0) return { triggered: false, relatedItemIds: [] };

      const totalCircuits = circuitItems.reduce(
        (sum, item) => sum + (item.quantity ?? 0),
        0,
      );
      if (totalCircuits === 0) return { triggered: false, relatedItemIds: [] };

      // 餐廳至少需 12 迴路（廚房 3+、空調 2+、照明 2+、插座 2+、備用 3）
      if (totalCircuits < 12) {
        return {
          triggered: true,
          relatedItemIds: circuitItems.map((item) => item.id),
        };
      }
      return { triggered: false, relatedItemIds: [] };
    },
  },
  // ── 餐廳：廚房防水 ──
  {
    id: "qty-rest-002",
    severity: "warning",
    title: "餐廳廚房防水面積可能不足",
    why: "商業廚房地面全天接觸水和油，防水應覆蓋全廚房地坪及牆面下半部，不做等於樓下漏水",
    suggestion: "請確認廚房防水面積涵蓋全廚房地坪及牆面至少 30cm 高",
    check: (items, site) => {
      if (site.buildingType !== "restaurant") return { triggered: false, relatedItemIds: [] };

      const hasKitchen = items.some(
        (item) =>
          item.itemName.includes("廚房") ||
          item.itemName.includes("爐台") ||
          item.itemName.includes("中島"),
      );
      if (!hasKitchen) return { triggered: false, relatedItemIds: [] };

      const hasWaterproof = items.some(
        (item) =>
          item.category === "waterproofing" &&
          (item.itemName.includes("廚房") || item.itemName.includes("全區")),
      );
      if (!hasWaterproof) {
        return {
          triggered: true,
          relatedItemIds: items
            .filter((item) => item.itemName.includes("廚房"))
            .map((item) => item.id),
        };
      }
      return { triggered: false, relatedItemIds: [] };
    },
  },
];
