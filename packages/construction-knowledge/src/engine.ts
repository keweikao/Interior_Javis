import type {
  QuotationItem,
  SiteCondition,
  Override,
  RiskAlert,
  DependencyRule,
  TemplateItem,
} from "./types.js";
import { dependencyRules } from "./rules/dependency.js";
import { siteConflictRules } from "./rules/site-conflict.js";
import { quantityRules } from "./rules/quantity.js";
import { allTemplates } from "./templates/index.js";

let alertCounter = 0;

function generateAlertId(): string {
  alertCounter += 1;
  return `alert-${alertCounter.toString().padStart(4, "0")}`;
}

function itemMatchesKeywords(
  item: QuotationItem,
  keywords: string[],
): boolean {
  return keywords.some((keyword) => item.itemName.includes(keyword));
}

function findSuggestedTemplate(
  requiredKeywords: string[],
): TemplateItem | null {
  for (const keyword of requiredKeywords) {
    const found = allTemplates.find(
      (t) =>
        t.itemName.includes(keyword) ||
        keyword.includes(t.itemName),
    );
    if (found) return found;
  }
  return null;
}

function runDependencyCheck(
  items: QuotationItem[],
  rule: DependencyRule,
): RiskAlert | null {
  // Find items that trigger this rule
  const triggerItems = items.filter((item) =>
    itemMatchesKeywords(item, rule.triggerKeywords),
  );

  if (triggerItems.length === 0) return null;

  // Check if required items exist
  const searchItems = rule.searchInCategories
    ? items.filter(
        (item) =>
          rule.searchInCategories!.includes(item.category) ||
          itemMatchesKeywords(item, rule.requiredKeywords),
      )
    : items;

  const hasRequired = searchItems.some((item) =>
    itemMatchesKeywords(item, rule.requiredKeywords),
  );

  if (hasRequired) return null;

  // Special case for dep-009:天花板拆除 -> 天花板重做
  // The trigger keyword "天花板拆除" also contains "天花板",
  // so we must exclude trigger items from the required check
  if (rule.id === "dep-009") {
    const nonTriggerItems = items.filter(
      (item) => !itemMatchesKeywords(item, rule.triggerKeywords),
    );
    const hasRequiredExcludingTrigger = nonTriggerItems.some((item) =>
      itemMatchesKeywords(item, rule.requiredKeywords),
    );
    if (hasRequiredExcludingTrigger) return null;
  }

  return {
    id: generateAlertId(),
    ruleId: rule.id,
    severity: rule.severity,
    category: "dependency",
    title: rule.title,
    why: rule.why,
    suggestion: rule.suggestion,
    relatedItemIds: triggerItems.map((item) => item.id),
    suggestedTemplate: findSuggestedTemplate(rule.requiredKeywords),
    canOverride: rule.severity !== "critical",
  };
}

// 每個工種的具體風險說明
const CLARITY_RISK_BY_CATEGORY: Record<string, { why: string; suggestion: string }> = {
  protection: {
    why: "保護工程若未明確範圍（如公設保護、電梯保護、樓梯間），完工後管委會求償由誰負責容易產生爭議",
    suggestion: "建議明列保護範圍（電梯/走廊/大門）、保護方式（PP板/防潮布）及拆除恢復是否包含",
  },
  demolition: {
    why: "拆除範圍不明確（如拆到見底或僅拆面材）會影響後續泥作/防水的報價，實務上追加費最常發生在拆除",
    suggestion: "建議說明拆除深度（見底/僅面材）、廢棄物清運是否包含、粉塵防護措施",
  },
  plumbing: {
    why: "水電工程常見爭議：迴路數不足追加、燈具安裝費另計、衛浴設備安裝不含在水電報價中",
    suggestion: "建議明列迴路數量、插座/開關點位數、燈具安裝是否包含、衛浴設備安裝費",
  },
  masonry: {
    why: "泥作常見爭議：磁磚僅含工不含料、打底整平另計、磁磚損耗率未列入",
    suggestion: "建議說明是否含磁磚材料費、打底整平是否包含、磁磚損耗率比例",
  },
  waterproofing: {
    why: "防水層做法（塗佈層數/品牌）直接影響保固年限，未說明等於沒有保固依據",
    suggestion: "建議明列防水材料品牌、塗佈層數、保固年限、試水測試天數",
  },
  carpentry: {
    why: "木作工程最常追加：板材等級未定、五金另計、油漆/貼皮收尾不含在木作報價",
    suggestion: "建議說明板材等級（F1/F3）、五金品牌是否包含、表面處理（油漆/貼皮）是否含在內",
  },
  painting: {
    why: "油漆若未說明底漆/面漆層數與品牌，完工品質難以驗收，且補土整平常被當作追加項目",
    suggestion: "建議明列油漆品牌、底漆/面漆層數、批土整平是否包含、色號確認方式",
  },
  flooring: {
    why: "地板工程常見爭議：踢腳板另計、地面整平費另計、損耗率未計入",
    suggestion: "建議說明地板品牌/型號、踢腳板是否包含、地面整平費、損耗率比例",
  },
  ceiling: {
    why: "天花板工程常見追加：間接照明燈槽、維修孔、冷氣出回風口開孔常不含在天花板報價",
    suggestion: "建議說明板材規格、燈槽/維修孔是否包含、冷氣開孔及收邊",
  },
  cabinet: {
    why: "系統櫃/廚具常見爭議：五金配件（鉸鏈/滑軌）等級差異大、檯面材質另計、安裝費另計",
    suggestion: "建議明列板材品牌/等級、五金品牌（鉸鏈/滑軌/把手）、檯面材質、安裝費",
  },
  hvac: {
    why: "空調報價常見爭議：銅管/排水管/電源線路另計、室外機安裝架另計、既有設備拆除費另計",
    suggestion: "建議說明銅管/排水管是否包含、室外機安裝位置及架設費、保固條件",
  },
  window_door: {
    why: "門窗工程常見追加：拆除舊窗/舊門費用、泥作收邊修補費、五金配件（把手/鎖具）另計",
    suggestion: "建議明列拆舊是否包含、泥作收邊費用、五金配件品牌及規格",
  },
  cleaning: {
    why: "清潔工程最常見爭議：粗清和細清範圍不同，價差可達數萬；除膠、玻璃清潔、外牆清洗常不含在細清報價",
    suggestion: "建議明確區分粗清/細清範圍、除膠是否包含、特殊清潔（外牆/頑固污漬）是否另計",
  },
  transport: {
    why: "搬運費常見爭議：樓層加價未列明、搬運距離限制、假日加價、大型家具搬運費另計",
    suggestion: "建議說明搬運樓層是否加價、距離限制、大型物件定義及加價方式",
  },
};

const DEFAULT_CLARITY_RISK = {
  why: "報價項目未說明包含及不包含範圍，容易產生認知落差導致追加費用",
  suggestion: "建議補充此工項的「包含」及「不包含」說明，避免日後爭議",
};

function runClarityCheck(items: QuotationItem[]): RiskAlert[] {
  const alerts: RiskAlert[] = [];

  for (const item of items) {
    if (!item.includes && !item.excludes) {
      const risk = CLARITY_RISK_BY_CATEGORY[item.category] ?? DEFAULT_CLARITY_RISK;
      alerts.push({
        id: generateAlertId(),
        ruleId: "clarity-001",
        severity: "info",
        category: "clarity",
        title: `「${item.itemName}」缺少包含/不包含說明`,
        why: risk.why,
        suggestion: risk.suggestion,
        relatedItemIds: [item.id],
        suggestedTemplate: allTemplates.find(
          (t) =>
            t.itemName.includes(item.itemName) ||
            item.itemName.includes(t.itemName),
        ) ?? null,
        canOverride: true,
      });
    }
  }

  return alerts;
}

function severityOrder(severity: "critical" | "warning" | "info"): number {
  switch (severity) {
    case "critical":
      return 0;
    case "warning":
      return 1;
    case "info":
      return 2;
  }
}

export function runRiskEngine(input: {
  items: QuotationItem[];
  siteCondition: SiteCondition;
  overrides: Override[];
}): RiskAlert[] {
  // Reset counter for deterministic IDs within a single run
  alertCounter = 0;

  const { items, siteCondition, overrides } = input;
  const alerts: RiskAlert[] = [];

  // 1. Run dependency rules
  for (const rule of dependencyRules) {
    const alert = runDependencyCheck(items, rule);
    if (alert) {
      alerts.push(alert);
    }
  }

  // 2. Run site-conflict rules
  for (const rule of siteConflictRules) {
    const triggered = rule.check(items, siteCondition);
    if (triggered) {
      alerts.push({
        id: generateAlertId(),
        ruleId: rule.id,
        severity: rule.severity,
        category: "site_conflict",
        title: rule.title,
        why: rule.why,
        suggestion: rule.suggestion,
        relatedItemIds: [],
        suggestedTemplate: null,
        canOverride: rule.severity !== "critical",
      });
    }
  }

  // 3. Run quantity rules
  for (const rule of quantityRules) {
    const result = rule.check(items, siteCondition);
    if (result.triggered) {
      alerts.push({
        id: generateAlertId(),
        ruleId: rule.id,
        severity: rule.severity,
        category: "quantity",
        title: rule.title,
        why: rule.why,
        suggestion: rule.suggestion,
        relatedItemIds: result.relatedItemIds,
        suggestedTemplate: null,
        canOverride: true,
      });
    }
  }

  // 4. Run clarity check
  const clarityAlerts = runClarityCheck(items);
  alerts.push(...clarityAlerts);

  // 5. Filter out overridden alerts
  const overriddenRuleIds = new Set(overrides.map((o) => o.ruleId));
  const filteredAlerts = alerts.filter(
    (alert) => !overriddenRuleIds.has(alert.ruleId),
  );

  // 6. Sort: critical first, then warning, then info
  filteredAlerts.sort(
    (a, b) => severityOrder(a.severity) - severityOrder(b.severity),
  );

  return filteredAlerts;
}
