import rawConstraints from './data/linguistic-constraints.json';
import { chinese, LanguageEnum } from '@/app/languages';

export const constraintDifficulties = ['beginner', 'intermediate', 'advanced'] as const;

export type ConstraintDifficulty = (typeof constraintDifficulties)[number];

export interface LinguisticConstraint {
  id: string;
  category: string;
  name: string;
  instruction: string;
  examples: {
    en: string;
    zh: string;
  };
  difficulty?: ConstraintDifficulty;
  weight?: number;
}

const categoryLabels: Record<string, string> = {
  grammatical_structures: 'Grammatical structures',
  communicative_functions: 'Communicative functions',
  rhetorical_techniques: 'Rhetorical techniques',
  conversational_techniques: 'Conversational techniques',
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const isDifficulty = (value: unknown): value is ConstraintDifficulty =>
  typeof value === 'string' &&
  constraintDifficulties.includes(value as ConstraintDifficulty);

export const isLinguisticConstraint = (
  value: unknown,
): value is LinguisticConstraint => {
  if (!isRecord(value)) return false;
  if (typeof value.id !== 'string' || value.id.length === 0) return false;
  if (typeof value.category !== 'string' || value.category.length === 0) {
    return false;
  }
  if (typeof value.name !== 'string' || value.name.length === 0) return false;
  if (typeof value.instruction !== 'string' || value.instruction.length === 0) {
    return false;
  }
  if (!isRecord(value.examples)) return false;
  if (typeof value.examples.en !== 'string' || value.examples.en.length === 0) {
    return false;
  }
  if (typeof value.examples.zh !== 'string' || value.examples.zh.length === 0) {
    return false;
  }
  if (value.difficulty !== undefined && !isDifficulty(value.difficulty)) {
    return false;
  }
  if (
    value.weight !== undefined &&
    (typeof value.weight !== 'number' ||
      !Number.isFinite(value.weight) ||
      value.weight <= 0)
  ) {
    return false;
  }
  return true;
};

export const parseLinguisticConstraints = (
  data: unknown,
): LinguisticConstraint[] => {
  if (!Array.isArray(data)) {
    throw new Error('Linguistic constraints must be an array');
  }

  return data.map((item, index) => {
    if (!isLinguisticConstraint(item)) {
      throw new Error(`Invalid linguistic constraint at index ${index}`);
    }
    return item;
  });
};

export const linguisticConstraints = parseLinguisticConstraints(rawConstraints);

export const categoriesInOrder = (
  constraints: LinguisticConstraint[],
): string[] => {
  const seen = new Set<string>();
  const order: string[] = [];
  constraints.forEach((constraint) => {
    if (seen.has(constraint.category)) return;
    seen.add(constraint.category);
    order.push(constraint.category);
  });
  return order;
};

export const categoryLabel = (category: string): string => {
  const known = categoryLabels[category];
  if (known) return known;
  return category
    .split('_')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
};

export interface ConstraintExampleCopy {
  primary: string;
  primaryLabel: string;
  english: string | null;
}

export const constraintExampleCopy = (
  constraint: LinguisticConstraint,
  language: LanguageEnum | string,
): ConstraintExampleCopy => {
  if (language === chinese && constraint.examples.zh) {
    return {
      primary: constraint.examples.zh,
      primaryLabel: 'Chinese',
      english: constraint.examples.en,
    };
  }

  return {
    primary: constraint.examples.en,
    primaryLabel: 'English',
    english: null,
  };
};
