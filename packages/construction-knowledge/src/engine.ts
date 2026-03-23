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

function runClarityCheck(items: QuotationItem[]): RiskAlert[] {
  const alerts: RiskAlert[] = [];

  for (const item of items) {
    if (!item.includes && !item.excludes) {
      alerts.push({
        id: generateAlertId(),
        ruleId: "clarity-001",
        severity: "info",
        category: "clarity",
        title: `「${item.itemName}」缺少包含/不包含說明`,
        why: "報價項目未說明包含及不包含範圍，容易產生認知落差導致追加費用",
        suggestion: "建議補充此工項的「包含」及「不包含」說明，避免日後爭議",
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
