export type TradeCategory =
  | "protection"
  | "demolition"
  | "plumbing"
  | "masonry"
  | "waterproofing"
  | "carpentry"
  | "painting"
  | "flooring"
  | "ceiling"
  | "cabinet"
  | "hvac"
  | "window_door"
  | "cleaning"
  | "transport"
  | "other";

export type ProjectType =
  | "new_build"
  | "mid_age"
  | "old_renovation"
  | "partial"
  | "commercial"
  | "retail"
  | "restaurant"
  | "raw"
  | "office";

export interface SiteCondition {
  totalArea: number;
  floorLevel: number;
  hasElevator: boolean;
  buildingType: ProjectType;
  buildingAge: number;
  clientBudget: number | null;
}

export interface QuotationItem {
  id: string;
  category: TradeCategory;
  itemName: string;
  unit: string;
  quantity: number | null;
  unitPrice: number | null;
  totalPrice: number | null;
  includes: string | null;
  excludes: string | null;
  specification: string | null;
}

export interface TemplateItem {
  id: string;
  category: TradeCategory;
  itemName: string;
  unit: string;
  description: string;
  defaultIncludes: string;
  defaultExcludes: string;
  applicableTypes: ProjectType[];
  commonlyMissed: boolean;
  sortOrder: number;
}

export interface RiskAlert {
  id: string;
  ruleId: string;
  severity: "critical" | "warning" | "info";
  category: "dependency" | "site_conflict" | "quantity" | "clarity";
  title: string;
  why: string;
  suggestion: string;
  relatedItemIds: string[];
  suggestedTemplate: TemplateItem | null;
  canOverride: boolean;
}

export interface Override {
  ruleId: string;
  reason: string;
  alertTitle: string;
}

export interface BudgetCheckResult {
  feasible: boolean;
  riskLevel: "safe" | "tight" | "unrealistic";
  estimatedRange: { min: number; max: number };
  gap: number | null;
  message: string;
}

export interface DependencyRule {
  id: string;
  severity: "critical" | "warning" | "info";
  triggerKeywords: string[];
  requiredKeywords: string[];
  searchInCategories?: TradeCategory[];
  title: string;
  why: string;
  suggestion: string;
}

export interface SiteConflictRule {
  id: string;
  severity: "critical" | "warning" | "info";
  title: string;
  why: string;
  suggestion: string;
  check: (items: QuotationItem[], site: SiteCondition) => boolean;
}

export interface QuantityRule {
  id: string;
  severity: "critical" | "warning" | "info";
  title: string;
  why: string;
  suggestion: string;
  check: (items: QuotationItem[], site: SiteCondition) => { triggered: boolean; relatedItemIds: string[] };
}
