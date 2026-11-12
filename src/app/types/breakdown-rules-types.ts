// Mirrors the backend rule registry (firebase-google-translate/functions/src/rules).
// Rule keys are `${category}.${optionId}`, e.g. "constructions.subjunctive".

export interface RuleCatalogOption {
  key: string;
  id: string;
  name: string;
  description?: string;
}

export interface RuleCatalogGroup {
  id: string;
  name: string;
  description?: string;
  options: RuleCatalogOption[];
}

export interface RuleCatalogCategory {
  category: string;
  title: string;
  description?: string;
  groups: RuleCatalogGroup[];
}

export const MAX_BREAKDOWN_RULES = 40;
