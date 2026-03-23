import type { ProjectType, TemplateItem, TradeCategory } from "../types.js";
import { protectionTemplates } from "./protection.js";
import { demolitionTemplates } from "./demolition.js";
import { plumbingTemplates } from "./plumbing.js";
import { masonryTemplates } from "./masonry.js";
import { waterproofingTemplates } from "./waterproofing.js";
import { carpentryTemplates } from "./carpentry.js";
import { paintingTemplates } from "./painting.js";
import { flooringTemplates } from "./flooring.js";
import { cabinetTemplates } from "./cabinet.js";
import { hvacTemplates } from "./hvac.js";
import { cleaningTemplates } from "./cleaning.js";
import { transportTemplates } from "./transport.js";

export {
  protectionTemplates,
  demolitionTemplates,
  plumbingTemplates,
  masonryTemplates,
  waterproofingTemplates,
  carpentryTemplates,
  paintingTemplates,
  flooringTemplates,
  cabinetTemplates,
  hvacTemplates,
  cleaningTemplates,
  transportTemplates,
};

export const allTemplates: TemplateItem[] = [
  ...protectionTemplates,
  ...demolitionTemplates,
  ...plumbingTemplates,
  ...masonryTemplates,
  ...waterproofingTemplates,
  ...carpentryTemplates,
  ...paintingTemplates,
  ...flooringTemplates,
  ...cabinetTemplates,
  ...hvacTemplates,
  ...cleaningTemplates,
  ...transportTemplates,
];

/**
 * Filter templates by project type AND selected categories.
 * If categories is empty or undefined, returns all categories for the project type.
 */
export function getTemplatesByType(
  projectType: ProjectType,
  categories?: TradeCategory[],
): TemplateItem[] {
  return allTemplates.filter((t) => {
    const matchesType = t.applicableTypes.includes(projectType);
    const matchesCategory =
      !categories || categories.length === 0 || categories.includes(t.category);
    return matchesType && matchesCategory;
  });
}
