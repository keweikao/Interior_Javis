import { describe, it, expect } from "bun:test";
import { checkBudgetFeasibility } from "../budget.js";

describe("Budget Feasibility Check", () => {
  it("should return unrealistic for mid_age 30 ping with 1.8M budget", () => {
    const result = checkBudgetFeasibility({
      totalArea: 30,
      buildingType: "mid_age",
      clientBudget: 1800000,
    });

    // 1.8M / 30 = 60000/ping, range is 120000-200000, ratio = 0.5 < 0.7
    expect(result.feasible).toBe(false);
    expect(result.riskLevel).toBe("unrealistic");
  });

  it("should return safe for mid_age 30 ping with 5M budget", () => {
    const result = checkBudgetFeasibility({
      totalArea: 30,
      buildingType: "mid_age",
      clientBudget: 5000000,
    });

    // 5M / 30 = 166666/ping, range is 120000-200000
    expect(result.feasible).toBe(true);
    expect(result.riskLevel).toBe("safe");
  });

  it("should return safe for new_build 30 ping with 3M budget", () => {
    const result = checkBudgetFeasibility({
      totalArea: 30,
      buildingType: "new_build",
      clientBudget: 3000000,
    });

    // 3M / 30 = 100000/ping, range is 80000-120000
    expect(result.feasible).toBe(true);
    expect(result.riskLevel).toBe("safe");
  });

  it("should return unrealistic for old_renovation 20 ping with 1M budget", () => {
    const result = checkBudgetFeasibility({
      totalArea: 20,
      buildingType: "old_renovation",
      clientBudget: 1000000,
    });

    // 1M / 20 = 50000/ping, range is 150000-250000
    expect(result.feasible).toBe(false);
    expect(result.riskLevel).toBe("unrealistic");
  });

  it("should handle budget = 0 gracefully", () => {
    const result = checkBudgetFeasibility({
      totalArea: 30,
      buildingType: "mid_age",
      clientBudget: 0,
    });

    expect(result.feasible).toBe(false);
    expect(result.riskLevel).toBe("unrealistic");
    expect(result.message).toContain("未設定");
  });

  it("should return tight when budget is slightly below minimum", () => {
    const result = checkBudgetFeasibility({
      totalArea: 30,
      buildingType: "mid_age",
      clientBudget: 3000000,
    });

    // 3M / 30 = 100000/ping, range is 120000-200000
    // ratio = 100000/120000 = 0.83 >= 0.7
    expect(result.riskLevel).toBe("tight");
    expect(result.feasible).toBe(true);
  });

  it("should include estimated range in result", () => {
    const result = checkBudgetFeasibility({
      totalArea: 30,
      buildingType: "new_build",
      clientBudget: 3000000,
    });

    expect(result.estimatedRange.min).toBe(30 * 80000);
    expect(result.estimatedRange.max).toBe(30 * 120000);
  });
});
