import { describe, it, expect } from "bun:test";
import { runRiskEngine } from "../engine.js";
import type { QuotationItem, SiteCondition, Override } from "../types.js";

function makeItem(overrides: Partial<QuotationItem> & { id: string; itemName: string; category: QuotationItem["category"] }): QuotationItem {
  return {
    unit: "式",
    quantity: 1,
    unitPrice: null,
    totalPrice: null,
    includes: null,
    excludes: null,
    specification: null,
    ...overrides,
  };
}

const defaultSite: SiteCondition = {
  totalArea: 30,
  floorLevel: 5,
  hasElevator: true,
  buildingType: "mid_age",
  buildingAge: 15,
  clientBudget: 3000000,
};

describe("Risk Engine - Dependency Rules", () => {
  it("should alert when quotation has HRV but no drilling", () => {
    const items: QuotationItem[] = [
      makeItem({ id: "1", itemName: "全熱交換器安裝", category: "hvac" }),
    ];

    const alerts = runRiskEngine({ items, siteCondition: defaultSite, overrides: [] });
    const hrvAlert = alerts.find((a) => a.ruleId === "dep-001");

    expect(hrvAlert).toBeDefined();
    expect(hrvAlert!.severity).toBe("critical");
    expect(hrvAlert!.relatedItemIds).toContain("1");
  });

  it("should not alert when quotation has HRV and drilling", () => {
    const items: QuotationItem[] = [
      makeItem({ id: "1", itemName: "全熱交換器安裝", category: "hvac" }),
      makeItem({ id: "2", itemName: "洗洞", category: "masonry", quantity: 4 }),
    ];

    const alerts = runRiskEngine({ items, siteCondition: defaultSite, overrides: [] });
    const hrvAlert = alerts.find((a) => a.ruleId === "dep-001");

    expect(hrvAlert).toBeUndefined();
  });

  it("should alert when bathroom demolition has no waterproofing", () => {
    const items: QuotationItem[] = [
      makeItem({ id: "1", itemName: "浴室拆除", category: "demolition" }),
    ];

    const alerts = runRiskEngine({ items, siteCondition: defaultSite, overrides: [] });
    const wpAlert = alerts.find((a) => a.ruleId === "dep-002");

    expect(wpAlert).toBeDefined();
    expect(wpAlert!.severity).toBe("critical");
  });

  it("should alert when demolition has no waste removal", () => {
    const items: QuotationItem[] = [
      makeItem({ id: "1", itemName: "天花板拆除", category: "demolition" }),
    ];

    const alerts = runRiskEngine({ items, siteCondition: defaultSite, overrides: [] });
    const wasteAlert = alerts.find((a) => a.ruleId === "dep-005");

    expect(wasteAlert).toBeDefined();
    expect(wasteAlert!.severity).toBe("critical");
  });
});

describe("Risk Engine - Site Conflict Rules", () => {
  it("should alert for high floor without elevator with heavy materials", () => {
    const items: QuotationItem[] = [
      makeItem({ id: "1", itemName: "大板磚鋪貼", category: "masonry" }),
    ];

    const site: SiteCondition = {
      ...defaultSite,
      floorLevel: 5,
      hasElevator: false,
    };

    const alerts = runRiskEngine({ items, siteCondition: site, overrides: [] });
    const siteAlert = alerts.find((a) => a.ruleId === "site-001");

    expect(siteAlert).toBeDefined();
    expect(siteAlert!.severity).toBe("warning");
  });

  it("should alert when partial renovation has no protection", () => {
    const items: QuotationItem[] = [
      makeItem({ id: "1", itemName: "油漆工程", category: "painting" }),
    ];

    const site: SiteCondition = {
      ...defaultSite,
      buildingType: "partial",
    };

    const alerts = runRiskEngine({ items, siteCondition: site, overrides: [] });
    const siteAlert = alerts.find((a) => a.ruleId === "site-002");

    expect(siteAlert).toBeDefined();
    expect(siteAlert!.severity).toBe("warning");
  });
});

describe("Risk Engine - Quantity Rules", () => {
  it("should alert when paint area ratio is too low", () => {
    const items: QuotationItem[] = [
      makeItem({
        id: "1",
        itemName: "乳膠漆",
        category: "painting",
        unit: "坪",
        quantity: 25,
      }),
    ];

    const site: SiteCondition = {
      ...defaultSite,
      totalArea: 20,
    };

    const alerts = runRiskEngine({ items, siteCondition: site, overrides: [] });
    const qtyAlert = alerts.find((a) => a.ruleId === "qty-001");

    // ratio = 25/20 = 1.25, which is < 2.0, should trigger
    expect(qtyAlert).toBeDefined();
    expect(qtyAlert!.severity).toBe("warning");
  });
});

describe("Risk Engine - Override", () => {
  it("should remove alert when rule is overridden", () => {
    const items: QuotationItem[] = [
      makeItem({ id: "1", itemName: "全熱交換器安裝", category: "hvac" }),
    ];

    const overrides: Override[] = [
      { ruleId: "dep-001", reason: "業主自行處理洗洞" },
    ];

    const alerts = runRiskEngine({ items, siteCondition: defaultSite, overrides });
    const hrvAlert = alerts.find((a) => a.ruleId === "dep-001");

    expect(hrvAlert).toBeUndefined();
  });
});

describe("Risk Engine - Edge Cases", () => {
  it("should return no dependency/site/quantity alerts for empty items", () => {
    const alerts = runRiskEngine({
      items: [],
      siteCondition: defaultSite,
      overrides: [],
    });

    // No items means no triggers, no alerts
    expect(alerts.length).toBe(0);
  });

  it("should generate clarity alerts for items missing includes/excludes", () => {
    const items: QuotationItem[] = [
      makeItem({
        id: "1",
        itemName: "油漆工程",
        category: "painting",
        includes: null,
        excludes: null,
      }),
    ];

    const alerts = runRiskEngine({ items, siteCondition: defaultSite, overrides: [] });
    const clarityAlerts = alerts.filter((a) => a.category === "clarity");

    expect(clarityAlerts.length).toBeGreaterThan(0);
    expect(clarityAlerts[0]!.severity).toBe("info");
  });

  it("should sort alerts: critical first, then warning, then info", () => {
    const items: QuotationItem[] = [
      makeItem({ id: "1", itemName: "全熱交換器安裝", category: "hvac" }),
      makeItem({ id: "2", itemName: "天花板拆除", category: "demolition" }),
      makeItem({ id: "3", itemName: "油漆工程", category: "painting", includes: null, excludes: null }),
    ];

    const alerts = runRiskEngine({ items, siteCondition: defaultSite, overrides: [] });

    // Verify sorting order
    for (let i = 1; i < alerts.length; i++) {
      const prev = alerts[i - 1]!;
      const curr = alerts[i]!;
      const order = { critical: 0, warning: 1, info: 2 };
      expect(order[prev.severity]).toBeLessThanOrEqual(order[curr.severity]);
    }
  });
});
