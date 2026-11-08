export const SESSION_WORD_COUNT = 100;
export const VISIBLE_WORD_COUNT = 5;

export interface ConstraintLike {
  id: string;
  category: string;
  weight?: number;
}

export interface WordLike {
  id: string;
}

export interface ImprovConfig {
  enabledCategories: string[];
  weightingEnabled: boolean;
  wordLimit: number;
}

export interface HardListItem {
  type: 'word' | 'constraint';
  id: string;
}

export interface ImprovSession {
  started: boolean;
  enabledCategories: string[];
  weightingEnabled: boolean;
  poolWordIds: string[];
  dismissedWordIds: string[];
  completedConstraintIds: string[];
  currentWordId: string | null;
  currentConstraintId: string | null;
  hardItems: HardListItem[];
}

export type RandomFn = () => number;

export const emptySession = (): ImprovSession => ({
  started: false,
  enabledCategories: [],
  weightingEnabled: false,
  poolWordIds: [],
  dismissedWordIds: [],
  completedConstraintIds: [],
  currentWordId: null,
  currentConstraintId: null,
  hardItems: [],
});

const itemWeight = (item: ConstraintLike, weightingEnabled: boolean): number => {
  if (!weightingEnabled) return 1;
  const weight = item.weight;
  if (typeof weight !== 'number' || !Number.isFinite(weight) || weight <= 0) {
    return 1;
  }
  return weight;
};

export const shuffle = <T>(items: readonly T[], random: RandomFn): T[] => {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    const current = copy[i];
    copy[i] = copy[j];
    copy[j] = current;
  }
  return copy;
};

const weightedPick = (
  pool: ConstraintLike[],
  weightingEnabled: boolean,
  random: RandomFn,
): ConstraintLike => {
  const weights = pool.map((item) => itemWeight(item, weightingEnabled));
  const total = weights.reduce((sum, weight) => sum + weight, 0);
  let cursor = random() * total;

  for (let i = 0; i < pool.length; i += 1) {
    cursor -= weights[i];
    if (cursor < 0) return pool[i];
  }

  return pool[pool.length - 1];
};

export const pickConstraintId = ({
  constraints,
  enabledCategories,
  weightingEnabled,
  excludeIds,
  avoidId,
  random,
}: {
  constraints: ConstraintLike[];
  enabledCategories: string[];
  weightingEnabled: boolean;
  excludeIds: string[];
  avoidId: string | null;
  random: RandomFn;
}): string | null => {
  const enabled = new Set(enabledCategories);
  const excluded = new Set(excludeIds);
  const pool = constraints.filter(
    (constraint) =>
      enabled.has(constraint.category) && !excluded.has(constraint.id),
  );
  if (pool.length === 0) return null;

  const first = weightedPick(pool, weightingEnabled, random);
  if (!avoidId || first.id !== avoidId || pool.length === 1) return first.id;

  const rest = pool.filter((constraint) => constraint.id !== avoidId);
  if (rest.length === 0) return first.id;
  return weightedPick(rest, weightingEnabled, random).id;
};

export const eligibleWordIds = (session: ImprovSession): string[] => {
  const dismissed = new Set(session.dismissedWordIds);
  return session.poolWordIds.filter((id) => !dismissed.has(id));
};

export const visibleWordIds = (session: ImprovSession): string[] => {
  const eligible = eligibleWordIds(session);
  if (eligible.length === 0) return [];

  const count = Math.min(VISIBLE_WORD_COUNT, eligible.length);
  let start = session.currentWordId
    ? eligible.indexOf(session.currentWordId)
    : 0;
  if (start < 0) start = 0;
  const maxStart = eligible.length - count;
  if (start > maxStart) start = maxStart;
  return eligible.slice(start, start + count);
};

const wordAfter = (
  pool: string[],
  dismissed: string[],
  currentId: string | null,
): string | null => {
  const dismissedSet = new Set(dismissed);
  const eligible = pool.filter((id) => !dismissedSet.has(id));
  if (eligible.length === 0) return null;
  if (!currentId) return eligible[0];

  const poolIndex = pool.indexOf(currentId);
  const start = poolIndex === -1 ? 0 : poolIndex;
  for (let step = 1; step <= pool.length; step += 1) {
    const candidate = pool[(start + step) % pool.length];
    if (!dismissedSet.has(candidate)) return candidate;
  }
  return eligible[0];
};

export const startSession = (
  words: WordLike[],
  constraints: ConstraintLike[],
  config: ImprovConfig,
  random: RandomFn,
): ImprovSession => {
  const limit = Math.min(Math.max(Math.floor(config.wordLimit), 0), words.length);
  const poolWordIds = shuffle(words, random)
    .slice(0, limit)
    .map((word) => word.id);

  return {
    started: true,
    enabledCategories: [...config.enabledCategories],
    weightingEnabled: config.weightingEnabled,
    poolWordIds,
    dismissedWordIds: [],
    completedConstraintIds: [],
    currentWordId: poolWordIds[0] ?? null,
    currentConstraintId: pickConstraintId({
      constraints,
      enabledCategories: config.enabledCategories,
      weightingEnabled: config.weightingEnabled,
      excludeIds: [],
      avoidId: null,
      random,
    }),
    hardItems: [],
  };
};

export const nextConstraint = (
  session: ImprovSession,
  constraints: ConstraintLike[],
  random: RandomFn,
): ImprovSession => {
  if (!session.started) return session;
  const current = session.currentConstraintId;
  const completed = current
    ? [...session.completedConstraintIds, current]
    : [...session.completedConstraintIds];

  let nextId = pickConstraintId({
    constraints,
    enabledCategories: session.enabledCategories,
    weightingEnabled: session.weightingEnabled,
    excludeIds: completed,
    avoidId: current,
    random,
  });
  let completedConstraintIds = completed;

  if (!nextId) {
    completedConstraintIds = [];
    nextId = pickConstraintId({
      constraints,
      enabledCategories: session.enabledCategories,
      weightingEnabled: session.weightingEnabled,
      excludeIds: [],
      avoidId: current,
      random,
    });
  }

  return {
    ...session,
    completedConstraintIds,
    currentConstraintId: nextId,
  };
};

export const skipConstraint = (
  session: ImprovSession,
  constraints: ConstraintLike[],
  random: RandomFn,
): ImprovSession => {
  if (!session.started) return session;
  const nextId = pickConstraintId({
    constraints,
    enabledCategories: session.enabledCategories,
    weightingEnabled: session.weightingEnabled,
    excludeIds: session.completedConstraintIds,
    avoidId: session.currentConstraintId,
    random,
  });

  return {
    ...session,
    currentConstraintId: nextId,
  };
};

export const addHardItem = (
  session: ImprovSession,
  item: HardListItem,
): ImprovSession => {
  if (!session.started || !item.id) return session;
  const alreadyListed = session.hardItems.some(
    (entry) => entry.type === item.type && entry.id === item.id,
  );
  if (alreadyListed) return session;
  return {
    ...session,
    hardItems: [...session.hardItems, item],
  };
};

export const removeHardItem = (
  session: ImprovSession,
  item: HardListItem,
): ImprovSession => ({
  ...session,
  hardItems: session.hardItems.filter(
    (entry) => !(entry.type === item.type && entry.id === item.id),
  ),
});

export const dismissWord = (
  session: ImprovSession,
  wordId: string,
): ImprovSession => {
  if (!session.started || !wordId) return session;
  if (!session.poolWordIds.includes(wordId)) return session;
  if (session.dismissedWordIds.includes(wordId)) return session;

  const dismissedWordIds = [...session.dismissedWordIds, wordId];
  const currentWordId =
    session.currentWordId === wordId
      ? wordAfter(session.poolWordIds, dismissedWordIds, wordId)
      : session.currentWordId;

  return {
    ...session,
    dismissedWordIds,
    currentWordId,
  };
};

export const dismissCurrentWord = (session: ImprovSession): ImprovSession => {
  if (!session.currentWordId) return session;
  return dismissWord(session, session.currentWordId);
};

export const restoreWord = (
  session: ImprovSession,
  wordId: string,
): ImprovSession => {
  if (!session.poolWordIds.includes(wordId)) return session;
  return {
    ...session,
    dismissedWordIds: session.dismissedWordIds.filter((id) => id !== wordId),
    currentWordId: session.currentWordId ?? wordId,
  };
};

export const anotherWord = (session: ImprovSession): ImprovSession => {
  if (!session.started) return session;
  const eligible = eligibleWordIds(session);
  if (eligible.length === 0) {
    return { ...session, currentWordId: null };
  }
  if (eligible.length <= VISIBLE_WORD_COUNT) return session;

  const currentIndex = Math.max(
    0,
    session.currentWordId ? eligible.indexOf(session.currentWordId) : 0,
  );
  const nextIndex = currentIndex + VISIBLE_WORD_COUNT;
  return {
    ...session,
    currentWordId: eligible[nextIndex >= eligible.length ? 0 : nextIndex],
  };
};

export const endSession = (): ImprovSession => emptySession();
