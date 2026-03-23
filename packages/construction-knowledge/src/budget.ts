import type { ProjectType, BudgetCheckResult } from "./types.js";

interface BudgetRange {
  min: number;
  max: number;
}

function getBudgetRangePerPing(buildingType: ProjectType): BudgetRange {
  switch (buildingType) {
    case "new_build":
      return { min: 80000, max: 120000 };    // 新成屋 8-12 萬/坪（含設計）
    case "mid_age":
      return { min: 120000, max: 200000 };   // 中古屋(20年內) 12-20 萬/坪（含設計）
    case "old_renovation":
      return { min: 150000, max: 250000 };   // 老屋(40年) 15-25 萬/坪（含設計）
    case "partial":
      return { min: 50000, max: 100000 };    // 局部裝修 5-10 萬/坪
  }
}

export function checkBudgetFeasibility(input: {
  totalArea: number;
  buildingType: ProjectType;
  clientBudget: number;
}): BudgetCheckResult {
  const { totalArea, buildingType, clientBudget } = input;

  // Handle edge case: budget is 0 or negative
  if (clientBudget <= 0) {
    const range = getBudgetRangePerPing(buildingType);
    return {
      feasible: false,
      riskLevel: "unrealistic",
      estimatedRange: {
        min: totalArea * range.min,
        max: totalArea * range.max,
      },
      gap: null,
      message: "預算未設定或為零，無法評估可行性",
    };
  }

  // Handle edge case: totalArea is 0 or negative
  if (totalArea <= 0) {
    return {
      feasible: false,
      riskLevel: "unrealistic",
      estimatedRange: { min: 0, max: 0 },
      gap: null,
      message: "總坪數未設定或為零，無法評估可行性",
    };
  }

  const range = getBudgetRangePerPing(buildingType);
  const estimatedMin = totalArea * range.min;
  const estimatedMax = totalArea * range.max;

  const budgetPerPing = clientBudget / totalArea;

  if (budgetPerPing >= range.min) {
    // Budget is within or above the reasonable range
    if (budgetPerPing >= range.max) {
      return {
        feasible: true,
        riskLevel: "safe",
        estimatedRange: { min: estimatedMin, max: estimatedMax },
        gap: clientBudget - estimatedMax,
        message: `預算充裕，每坪約 ${Math.round(budgetPerPing / 10000)} 萬元，高於市場行情上限`,
      };
    }
    return {
      feasible: true,
      riskLevel: "safe",
      estimatedRange: { min: estimatedMin, max: estimatedMax },
      gap: clientBudget - estimatedMin,
      message: `預算合理，每坪約 ${Math.round(budgetPerPing / 10000)} 萬元，落在市場行情範圍內`,
    };
  }

  // Budget is below minimum
  const gap = clientBudget - estimatedMin;
  const ratio = budgetPerPing / range.min;

  if (ratio >= 0.7) {
    return {
      feasible: true,
      riskLevel: "tight",
      estimatedRange: { min: estimatedMin, max: estimatedMax },
      gap,
      message: `預算偏緊，每坪約 ${Math.round(budgetPerPing / 10000)} 萬元，低於市場行情下限，可能需要精簡工項`,
    };
  }

  return {
    feasible: false,
    riskLevel: "unrealistic",
    estimatedRange: { min: estimatedMin, max: estimatedMax },
    gap,
    message: `預算不足，每坪僅約 ${(budgetPerPing / 10000).toFixed(1)} 萬元，遠低於市場行情 ${range.min / 10000}-${range.max / 10000} 萬/坪，差距約 ${Math.abs(Math.round(gap / 10000))} 萬元`,
  };
}
