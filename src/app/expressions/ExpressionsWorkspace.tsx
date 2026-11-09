'use client';

import { useEffect, useMemo, useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LanguageEnum } from '@/app/languages';
import { WordTypes } from '@/app/types/word-types';
import { cn } from '@/lib/utils';
import { sortByDueDateWords } from '@/utils/sort-by-due-date';
import expressiveFunctionsFile from './data/expressive_functions.json';
import linguisticConstructionsFile from './data/linguistic_constructions.json';

type ChildItem = {
  id: string;
  name: string;
};

type Group = {
  id: string;
  name: string;
  children: ChildItem[];
};

type Selection = {
  group: Group;
  child: ChildItem | null;
};

const expressiveGroups: Group[] =
  expressiveFunctionsFile.expressive_functions.map((item) => ({
    id: item.id,
    name: item.name,
    children: item.subcategories,
  }));

const linguisticGroups: Group[] = [
  ...linguisticConstructionsFile.dimensions,
  ...linguisticConstructionsFile.separate_expression_dimensions,
].map((item) => ({
  id: item.id,
  name: item.name,
  children: item.options,
}));

const selectGroup = (current: Selection | null, group: Group): Selection | null => {
  if (current?.group.id === group.id && current.child === null) {
    return null;
  }

  return { group, child: null };
};

const selectChild = (
  current: Selection | null,
  group: Group,
  child: ChildItem,
): Selection => {
  if (current?.group.id === group.id && current.child?.id === child.id) {
    return { group, child: null };
  }

  return { group, child };
};

const formatSelection = (selection: Selection | null) => {
  if (!selection) return 'None';
  if (!selection.child) return selection.group.name;
  return `${selection.group.name} · ${selection.child.name}`;
};

const combineKey = (group: Group, child: ChildItem | null) =>
  child ? `${group.id}:${child.id}` : group.id;

const VISIBLE_WORD_COUNT = 5;

const pickRandom = <T,>(items: T[]): T =>
  items[Math.floor(Math.random() * items.length)];

const shuffle = <T,>(items: T[]): T[] => {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    const current = copy[index];
    copy[index] = copy[swapIndex];
    copy[swapIndex] = current;
  }
  return copy;
};

const wordLabel = (word: WordTypes) => word.surfaceForm || word.baseForm;

const formatWord = (word: WordTypes | null) => {
  if (!word) return 'None';
  const label = wordLabel(word);
  return word.definition ? `${label} · ${word.definition}` : label;
};

const randomSelection = (groups: Group[]): Selection => {
  const group = pickRandom(groups);
  const child = group.children.length > 0 ? pickRandom(group.children) : null;

  return { group, child };
};

interface GroupTilesProps {
  groups: Group[];
  selection: Selection | null;
  onSelectGroup: (group: Group) => void;
  onSelectChild: (group: Group, child: ChildItem) => void;
  testIdPrefix: string;
  expandRequest: { id: string; nonce: number } | null;
  combineKeys?: string[];
  onToggleCombine?: (group: Group, child: ChildItem | null) => void;
}

const GroupTiles = ({
  groups,
  selection,
  onSelectGroup,
  onSelectChild,
  testIdPrefix,
  expandRequest,
  combineKeys,
  onToggleCombine,
}: GroupTilesProps) => {
  const [openIds, setOpenIds] = useState<string[]>([]);

  useEffect(() => {
    if (!expandRequest) return;

    setOpenIds((current) =>
      current.includes(expandRequest.id) ? current : [...current, expandRequest.id],
    );
  }, [expandRequest]);

  const toggleOpen = (id: string) => {
    setOpenIds((current) =>
      current.includes(id)
        ? current.filter((openId) => openId !== id)
        : [...current, id],
    );
  };

  return (
    <div className='flex flex-wrap items-start gap-2'>
      {groups.map((group) => {
        const isOpen = openIds.includes(group.id);
        const isGroupSelected = selection?.group.id === group.id;
        const selectedChildId = isGroupSelected ? selection.child?.id : null;
        const groupCombineKey = combineKey(group, null);
        const groupIsCombined = combineKeys?.includes(groupCombineKey) ?? false;

        return (
          <div
            key={group.id}
            className={cn(
              'w-44 rounded border bg-white text-sm',
              isGroupSelected
                ? 'border-amber-700'
                : groupIsCombined ||
                    combineKeys?.some((key) => key.startsWith(`${group.id}:`))
                  ? 'border-sky-700'
                  : 'border-stone-300',
            )}
            data-testid={`${testIdPrefix}-tile-${group.id}`}
          >
            <div className='flex items-start gap-1 px-2 py-1'>
              {onToggleCombine && (
                <button
                  type='button'
                  className={cn(
                    'mt-0.5 h-4 w-4 shrink-0 rounded border',
                    groupIsCombined
                      ? 'border-sky-700 bg-sky-700'
                      : 'border-stone-400 bg-white',
                  )}
                  aria-pressed={groupIsCombined}
                  aria-label={`Combine ${group.name}`}
                  data-testid={`${testIdPrefix}-combine-${group.id}`}
                  onClick={() => onToggleCombine(group, null)}
                />
              )}
              <button
                type='button'
                className={cn(
                  'flex-1 text-left leading-snug',
                  isGroupSelected && !selectedChildId && 'font-semibold',
                )}
                aria-pressed={isGroupSelected && !selectedChildId}
                data-testid={`${testIdPrefix}-group-${group.id}`}
                onClick={() => onSelectGroup(group)}
              >
                {group.name}
              </button>
              <button
                type='button'
                className='mt-0.5 shrink-0 text-stone-600'
                aria-expanded={isOpen}
                aria-label={isOpen ? `Close ${group.name}` : `Open ${group.name}`}
                data-testid={`${testIdPrefix}-toggle-${group.id}`}
                onClick={() => toggleOpen(group.id)}
              >
                {isOpen ? (
                  <ChevronDown className='h-4 w-4' />
                ) : (
                  <ChevronRight className='h-4 w-4' />
                )}
              </button>
            </div>
            {isOpen && (
              <ul className='border-t border-stone-200 px-2 py-1'>
                {group.children.map((child) => {
                  const isChildSelected = selectedChildId === child.id;
                  const childCombineKey = combineKey(group, child);
                  const childIsCombined = combineKeys?.includes(childCombineKey) ?? false;

                  return (
                    <li key={child.id} className='flex items-start gap-1'>
                      {onToggleCombine && (
                        <button
                          type='button'
                          className={cn(
                            'mt-1 h-4 w-4 shrink-0 rounded border',
                            childIsCombined
                              ? 'border-sky-700 bg-sky-700'
                              : 'border-stone-400 bg-white',
                          )}
                          aria-pressed={childIsCombined}
                          aria-label={`Combine ${group.name} ${child.name}`}
                          data-testid={`${testIdPrefix}-combine-${group.id}-${child.id}`}
                          onClick={() => onToggleCombine(group, child)}
                        />
                      )}
                      <button
                        type='button'
                        className={cn(
                          'flex-1 py-0.5 text-left leading-snug',
                          isChildSelected && 'font-semibold',
                        )}
                        aria-pressed={isChildSelected}
                        data-testid={`${testIdPrefix}-child-${child.id}`}
                        onClick={() => onSelectChild(group, child)}
                      >
                        {child.name}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        );
      })}
    </div>
  );
};

type FunctionLabel = {
  name: string;
  detail: string | null;
};

type CombineItem = {
  key: string;
  group: Group;
  child: ChildItem | null;
};

type ExpressionSentence = {
  id: string;
  targetLang: string;
  transliteration?: string;
  baseLang: string;
  notes: string;
  expressive?: FunctionLabel | null;
  linguistic?: FunctionLabel | null;
  linguistics?: FunctionLabel[] | null;
  usedWord?: string;
};

const labelText = (label: FunctionLabel) =>
  label.detail ? `${label.name} · ${label.detail}` : label.name;

const selectionFromLabel = (
  groups: Group[],
  label?: FunctionLabel | null,
): Selection | null => {
  if (!label?.name) return null;
  const group = groups.find((item) => item.name === label.name);
  if (!group) return null;
  const child = label.detail
    ? (group.children.find((item) => item.name === label.detail) ?? null)
    : null;
  return { group, child };
};

const recipeSelections = (groups: Group[]): Selection[] =>
  groups.flatMap((group) =>
    group.children.length > 0
      ? group.children.map((child) => ({ group, child }))
      : [{ group, child: null }],
  );

const differentSelection = (groups: Group[], current: FunctionLabel): Selection => {
  const options = recipeSelections(groups).filter(
    (item) =>
      item.group.name !== current.name || (item.child?.name ?? null) !== current.detail,
  );
  return pickRandom(options.length > 0 ? options : recipeSelections(groups));
};

const namedChoice = (
  label: FunctionLabel | null | undefined,
  detailKey: 'subcategory' | 'option',
) =>
  label
    ? {
        name: label.name,
        [detailKey]: label.detail,
      }
    : null;

interface ExpressionsWorkspaceProps {
  dueWords: WordTypes[];
  words: WordTypes[];
  wordsReady: boolean;
  language: LanguageEnum;
}

const ExpressionsWorkspace = ({
  dueWords,
  words,
  wordsReady,
  language,
}: ExpressionsWorkspaceProps) => {
  const [expressiveSelection, setExpressiveSelection] = useState<Selection | null>(
    null,
  );
  const [linguisticSelection, setLinguisticSelection] = useState<Selection | null>(
    null,
  );
  const [expressiveExpand, setExpressiveExpand] = useState<{
    id: string;
    nonce: number;
  } | null>(null);
  const [linguisticExpand, setLinguisticExpand] = useState<{
    id: string;
    nonce: number;
  } | null>(null);
  const [dismissedWordIds, setDismissedWordIds] = useState<string[]>([]);
  const [batchIds, setBatchIds] = useState<string[] | null>(null);
  const [selectedWordId, setSelectedWordId] = useState<string | null>(null);
  const [expressiveSectionOpen, setExpressiveSectionOpen] = useState(true);
  const [linguisticSectionOpen, setLinguisticSectionOpen] = useState(true);
  const [results, setResults] = useState<ExpressionSentence[]>([]);
  const [creatingSentence, setCreatingSentence] = useState(false);
  const [creatingMulti, setCreatingMulti] = useState(false);
  const [creatingCombine, setCreatingCombine] = useState(false);
  const [combinedLinguistic, setCombinedLinguistic] = useState<CombineItem[]>([]);
  const [pairingKey, setPairingKey] = useState<string | null>(null);
  const [createError, setCreateError] = useState('');

  const orderedDueWords = useMemo(
    () => [...dueWords].sort(sortByDueDateWords),
    [dueWords],
  );
  const dueWordKey = orderedDueWords.map((word) => word.id).join('\0');

  useEffect(() => {
    setDismissedWordIds([]);
    setSelectedWordId(null);
    setBatchIds(null);
  }, [dueWordKey]);

  const wordPool = words.length > 0 ? words : orderedDueWords;
  const visibleWords = batchIds
    ? batchIds.flatMap((id) => {
        const word = wordPool.find((item) => item.id === id);
        return word && !dismissedWordIds.includes(word.id) ? [word] : [];
      })
    : orderedDueWords
        .filter((word) => !dismissedWordIds.includes(word.id))
        .slice(0, VISIBLE_WORD_COUNT);
  const selectedWord = wordPool.find((word) => word.id === selectedWordId) ?? null;

  const dismissWord = (wordId: string) => {
    setDismissedWordIds((current) =>
      current.includes(wordId) ? current : [...current, wordId],
    );
    setSelectedWordId((current) => (current === wordId ? null : current));
    setBatchIds((current) => {
      if (!current) return current;
      const remaining = current.filter((id) => id !== wordId);
      const used = new Set([...remaining, ...dismissedWordIds, wordId]);
      const replacement = wordPool.find((word) => !used.has(word.id));
      return replacement ? [...remaining, replacement.id] : remaining;
    });
  };

  const replaceWordBatch = () => {
    const currentIds = new Set(visibleWords.map((word) => word.id));
    const available = wordPool.filter((word) => !dismissedWordIds.includes(word.id));
    const fresh = shuffle(available.filter((word) => !currentIds.has(word.id)));
    const fallback = shuffle(available.filter((word) => currentIds.has(word.id)));
    const next = [...fresh, ...fallback].slice(0, VISIBLE_WORD_COUNT);

    setBatchIds(next.map((word) => word.id));
    setSelectedWordId((current) =>
      current && next.some((word) => word.id === current) ? current : null,
    );
  };

  const pickRandomRecipe = () => {
    const expressive = randomSelection(expressiveGroups);
    const linguistic = randomSelection(linguisticGroups);
    const otherWords = visibleWords.filter((word) => word.id !== selectedWordId);
    const candidates = otherWords.length > 0 ? otherWords : visibleWords;
    const word = candidates.length > 0 ? pickRandom(candidates) : null;

    setExpressiveSelection(expressive);
    setLinguisticSelection(linguistic);
    setExpressiveExpand((current) => ({
      id: expressive.group.id,
      nonce: (current?.nonce ?? 0) + 1,
    }));
    setLinguisticExpand((current) => ({
      id: linguistic.group.id,
      nonce: (current?.nonce ?? 0) + 1,
    }));
    if (word) {
      setSelectedWordId(word.id);
    }

    return { expressive, linguistic, word };
  };

  const selectRandomPair = () => {
    pickRandomRecipe();
  };

  const creating =
    creatingSentence || creatingMulti || creatingCombine || pairingKey !== null;
  const canCreateSentence = Boolean(
    language && (expressiveSelection || linguisticSelection || selectedWord),
  );
  const canCreateMulti = Boolean(language && visibleWords.length > 0);

  const selectionLabel = (
    selection: Selection | null,
    detailFromChild: boolean,
  ): FunctionLabel | null => {
    if (!selection) return null;
    return {
      name: selection.group.name,
      detail: detailFromChild ? selection.child?.name ?? null : null,
    };
  };

  const createSentence = async () => {
    if (!canCreateSentence || creating) return;

    setCreatingSentence(true);
    setCreateError('');

    try {
      const response = await fetch('/api/expression-sentence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          language,
          expressive: expressiveSelection
            ? {
                name: expressiveSelection.group.name,
                subcategory: expressiveSelection.child?.name ?? null,
              }
            : null,
          linguistic: linguisticSelection
            ? {
                name: linguisticSelection.group.name,
                option: linguisticSelection.child?.name ?? null,
              }
            : null,
          word: selectedWord
            ? {
                surfaceForm: selectedWord.surfaceForm,
                baseForm: selectedWord.baseForm,
                definition: selectedWord.definition,
              }
            : null,
        }),
      });
      const data = (await response.json()) as ExpressionSentence & { error?: string };
      if (!response.ok) {
        throw new Error(data.error || 'Could not create a sentence.');
      }

      setResults((current) => [
        {
          id: crypto.randomUUID(),
          targetLang: data.targetLang,
          transliteration: data.transliteration,
          baseLang: data.baseLang,
          notes: data.notes,
          expressive: selectionLabel(expressiveSelection, true),
          linguistic: selectionLabel(linguisticSelection, true),
        },
        ...current,
      ]);
    } catch (error) {
      setCreateError(
        error instanceof Error ? error.message : 'Could not create a sentence.',
      );
    } finally {
      setCreatingSentence(false);
    }
  };

  const createSentenceMulti = async () => {
    if (!canCreateMulti || creating) return;

    const inspirationWords = visibleWords.map((item) => ({
      surfaceForm: item.surfaceForm,
      baseForm: item.baseForm,
      definition: item.definition,
    }));
    const { expressive, linguistic } = pickRandomRecipe();
    setExpressiveSectionOpen(true);
    setLinguisticSectionOpen(true);
    setCreatingMulti(true);
    setCreateError('');

    try {
      const response = await fetch('/api/expression-sentence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          language,
          inspiration: true,
          expressive: {
            name: expressive.group.name,
            subcategory: expressive.child?.name ?? null,
          },
          linguistic: {
            name: linguistic.group.name,
            option: linguistic.child?.name ?? null,
          },
          words: inspirationWords,
        }),
      });
      const data = (await response.json()) as ExpressionSentence & { error?: string };
      if (!response.ok) {
        throw new Error(data.error || 'Could not create a sentence.');
      }

      setResults((current) => [
        {
          id: crypto.randomUUID(),
          targetLang: data.targetLang,
          transliteration: data.transliteration,
          baseLang: data.baseLang,
          notes: data.notes,
          expressive: selectionLabel(expressive, true),
          linguistic: selectionLabel(linguistic, true),
        },
        ...current,
      ]);
    } catch (error) {
      setCreateError(
        error instanceof Error ? error.message : 'Could not create a sentence.',
      );
    } finally {
      setCreatingMulti(false);
    }
  };

  const toggleCombine = (group: Group, child: ChildItem | null) => {
    const key = combineKey(group, child);
    setCombinedLinguistic((current) =>
      current.some((item) => item.key === key)
        ? current.filter((item) => item.key !== key)
        : [...current, { key, group, child }],
    );
  };

  const createCombinedSentence = async () => {
    if (!language || combinedLinguistic.length < 2 || creating) return;

    const linguisticLabels = combinedLinguistic.map((item) => ({
      name: item.group.name,
      detail: item.child?.name ?? null,
    }));
    const expressiveLabel = selectionLabel(expressiveSelection, true);
    setCreatingCombine(true);
    setCreateError('');

    try {
      const response = await fetch('/api/expression-sentence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          language,
          combine: true,
          expressive: namedChoice(expressiveLabel, 'subcategory'),
          linguistics: linguisticLabels.map((label) => namedChoice(label, 'option')),
          words: visibleWords.map((item) => ({
            surfaceForm: item.surfaceForm,
            baseForm: item.baseForm,
            definition: item.definition,
          })),
        }),
      });
      const data = (await response.json()) as ExpressionSentence & { error?: string };
      if (!response.ok) {
        throw new Error(data.error || 'Could not create a sentence.');
      }

      setResults((current) => [
        {
          id: crypto.randomUUID(),
          targetLang: data.targetLang,
          transliteration: data.transliteration,
          baseLang: data.baseLang,
          notes: data.notes,
          expressive: expressiveLabel,
          linguistics: linguisticLabels,
        },
        ...current,
      ]);
    } catch (error) {
      setCreateError(
        error instanceof Error ? error.message : 'Could not create a sentence.',
      );
    } finally {
      setCreatingCombine(false);
    }
  };

  const showRecipe = (expressive: Selection | null, linguistic: Selection | null) => {
    if (expressive) {
      setExpressiveSelection(expressive);
      setExpressiveSectionOpen(true);
      setExpressiveExpand((current) => ({
        id: expressive.group.id,
        nonce: (current?.nonce ?? 0) + 1,
      }));
    }
    if (linguistic) {
      setLinguisticSelection(linguistic);
      setLinguisticSectionOpen(true);
      setLinguisticExpand((current) => ({
        id: linguistic.group.id,
        nonce: (current?.nonce ?? 0) + 1,
      }));
    }
  };

  const pairSentence = async (
    result: ExpressionSentence,
    slot: 'expressive' | 'linguistic',
  ) => {
    const currentLabel = slot === 'expressive' ? result.expressive : result.linguistic;
    if (!language || !currentLabel || creating) return;

    const replacement = differentSelection(
      slot === 'expressive' ? expressiveGroups : linguisticGroups,
      currentLabel,
    );
    const expressive =
      slot === 'expressive' ? replacement : selectionFromLabel(expressiveGroups, result.expressive);
    const linguistic =
      slot === 'linguistic' ? replacement : selectionFromLabel(linguisticGroups, result.linguistic);
    const expressiveLabel =
      slot === 'expressive' ? selectionLabel(replacement, true) : (result.expressive ?? null);
    const linguisticLabel =
      slot === 'linguistic' ? selectionLabel(replacement, true) : (result.linguistic ?? null);

    showRecipe(expressive, linguistic);
    setPairingKey(`${result.id}:${slot}`);
    setCreateError('');

    try {
      const response = await fetch('/api/expression-sentence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          language,
          pair: true,
          swapped: slot,
          expressive: namedChoice(expressiveLabel, 'subcategory'),
          linguistic: namedChoice(linguisticLabel, 'option'),
          previous: {
            targetLang: result.targetLang,
            baseLang: result.baseLang,
            expressive: namedChoice(result.expressive, 'subcategory'),
            linguistic: namedChoice(result.linguistic, 'option'),
          },
        }),
      });
      const data = (await response.json()) as ExpressionSentence & { error?: string };
      if (!response.ok) {
        throw new Error(data.error || 'Could not create a sentence.');
      }

      setResults((current) => [
        {
          id: crypto.randomUUID(),
          targetLang: data.targetLang,
          transliteration: data.transliteration,
          baseLang: data.baseLang,
          notes: data.notes,
          expressive: expressiveLabel,
          linguistic: linguisticLabel,
        },
        ...current,
      ]);
    } catch (error) {
      setCreateError(
        error instanceof Error ? error.message : 'Could not create a sentence.',
      );
    } finally {
      setPairingKey(null);
    }
  };

  return (
    <div className='mt-4 space-y-4'>
      <section
        className='flex items-start justify-between gap-3 rounded border border-stone-300 bg-white px-3 py-2 text-sm'
        data-testid='expressions-selection'
      >
        <div>
          <p>
            <span className='text-stone-500'>Expressive function: </span>
            {formatSelection(expressiveSelection)}
          </p>
          <p>
            <span className='text-stone-500'>Linguistic construction: </span>
            {formatSelection(linguisticSelection)}
          </p>
          <p>
            <span className='text-stone-500'>Word: </span>
            {formatWord(selectedWord)}
          </p>
        </div>
        <div className='flex shrink-0 flex-col gap-2'>
          <Button
            type='button'
            variant='outline'
            size='sm'
            data-testid='expressions-random'
            onClick={selectRandomPair}
          >
            Random
          </Button>
          <Button
            type='button'
            size='sm'
            data-testid='expressions-create'
            disabled={!canCreateSentence || creating}
            onClick={createSentence}
          >
            {creatingSentence ? 'Creating…' : 'Create sentence'}
          </Button>
          <Button
            type='button'
            variant='secondary'
            size='sm'
            data-testid='expressions-create-multi'
            disabled={!canCreateMulti || creating}
            onClick={createSentenceMulti}
          >
            {creatingMulti ? 'Creating…' : 'Create sentence multi'}
          </Button>
        </div>
      </section>

      <section data-testid='expressions-words'>
        <div className='mb-2'>
          <Button
            type='button'
            variant='outline'
            size='sm'
            data-testid='expressions-random-words'
            disabled={!wordsReady || wordPool.length === 0}
            onClick={replaceWordBatch}
          >
            Random word generator
          </Button>
        </div>
        {!wordsReady ? (
          <p className='text-sm text-stone-500'>Loading words…</p>
        ) : visibleWords.length === 0 ? (
          <p className='text-sm text-stone-500'>No due words.</p>
        ) : (
          <ul className='flex flex-wrap items-start gap-2'>
            {visibleWords.map((word) => {
              const label = wordLabel(word);
              const isSelected = word.id === selectedWordId;

              return (
                <li
                  key={word.id}
                  className={cn(
                    'flex w-44 items-start gap-1 rounded border bg-white px-2 py-1 text-sm',
                    isSelected ? 'border-amber-700' : 'border-stone-300',
                  )}
                  data-testid={`expressions-word-tile-${word.id}`}
                >
                  <button
                    type='button'
                    className={cn(
                      'flex-1 text-left leading-snug',
                      isSelected && 'font-semibold',
                    )}
                    aria-pressed={isSelected}
                    data-testid={`expressions-word-${word.id}`}
                    onClick={() => setSelectedWordId(word.id)}
                  >
                    <span className='block'>{label}</span>
                    {word.definition && (
                      <span className='block font-normal text-stone-500'>
                        {word.definition}
                      </span>
                    )}
                  </button>
                  <button
                    type='button'
                    className='shrink-0 text-stone-500'
                    aria-label={`Dismiss ${label}`}
                    data-testid={`expressions-dismiss-${word.id}`}
                    onClick={() => dismissWord(word.id)}
                  >
                    ×
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section data-testid='expressions-results'>
        <h2 className='mb-2 text-sm font-medium'>Results</h2>
        {createError && (
          <p className='mb-2 text-sm text-red-700' data-testid='expressions-create-error'>
            {createError}
          </p>
        )}
        {results.length === 0 ? (
          <p className='text-sm text-stone-500'>No sentences yet.</p>
        ) : (
          <ol className='space-y-2'>
            {results.map((result) => (
              <li
                key={result.id}
                className='rounded border border-stone-300 bg-white px-3 py-2 text-sm'
                data-testid='expressions-result'
              >
                {(result.expressive ||
                  result.linguistic ||
                  (result.linguistics && result.linguistics.length > 0)) && (
                  <div className='mb-1 flex flex-wrap items-center gap-1'>
                    {result.expressive && (
                      <span className='inline-flex items-center gap-1'>
                        <span
                          className='rounded bg-amber-100 px-1.5 py-0.5 text-xs text-amber-900'
                          data-testid='expressions-result-expressive'
                        >
                          {labelText(result.expressive)}
                        </span>
                        {!(result.linguistics && result.linguistics.length > 1) && (
                          <button
                            type='button'
                            className='rounded border border-amber-300 px-1 py-0.5 text-xs text-amber-900 disabled:opacity-50'
                            aria-label={`Swap expressive function for ${result.targetLang}`}
                            data-testid={`expressions-pair-expressive-${result.id}`}
                            disabled={creating}
                            onClick={() => pairSentence(result, 'expressive')}
                          >
                            {pairingKey === `${result.id}:expressive` ? '…' : 'Swap'}
                          </button>
                        )}
                      </span>
                    )}
                    {(result.linguistics?.length
                      ? result.linguistics
                      : result.linguistic
                        ? [result.linguistic]
                        : []
                    ).map((label) => (
                      <span
                        key={`${label.name}:${label.detail ?? ''}`}
                        className='inline-flex items-center gap-1'
                      >
                        <span
                          className='rounded bg-sky-100 px-1.5 py-0.5 text-xs text-sky-900'
                          data-testid='expressions-result-linguistic'
                        >
                          {labelText(label)}
                        </span>
                        {!(result.linguistics && result.linguistics.length > 1) && (
                          <button
                            type='button'
                            className='rounded border border-sky-300 px-1 py-0.5 text-xs text-sky-900 disabled:opacity-50'
                            aria-label={`Swap linguistic construction for ${result.targetLang}`}
                            data-testid={`expressions-pair-linguistic-${result.id}`}
                            disabled={creating}
                            onClick={() => pairSentence(result, 'linguistic')}
                          >
                            {pairingKey === `${result.id}:linguistic` ? '…' : 'Swap'}
                          </button>
                        )}
                      </span>
                    ))}
                  </div>
                )}
                <p>{result.targetLang}</p>
                {result.transliteration && (
                  <p
                    className='text-stone-500'
                    data-testid='expressions-result-transliteration'
                  >
                    {result.transliteration}
                  </p>
                )}
                <p className='text-stone-600'>{result.baseLang}</p>
                <p className='mt-1 text-stone-500'>{result.notes}</p>
              </li>
            ))}
          </ol>
        )}
      </section>

      <section>
        <button
          type='button'
          className='mb-2 flex items-center gap-1 text-sm'
          aria-expanded={expressiveSectionOpen}
          data-testid='expressions-expressive-section'
          onClick={() => setExpressiveSectionOpen((open) => !open)}
        >
          {expressiveSectionOpen ? (
            <ChevronDown className='h-4 w-4' />
          ) : (
            <ChevronRight className='h-4 w-4' />
          )}
          Expressive functions
        </button>
        {expressiveSectionOpen && (
          <GroupTiles
            groups={expressiveGroups}
            selection={expressiveSelection}
            onSelectGroup={(group) =>
              setExpressiveSelection((current) => selectGroup(current, group))
            }
            onSelectChild={(group, child) =>
              setExpressiveSelection((current) => selectChild(current, group, child))
            }
            testIdPrefix='expressive'
            expandRequest={expressiveExpand}
          />
        )}
      </section>

      <hr className='border-stone-300' />

      <section>
        <button
          type='button'
          className='mb-2 flex items-center gap-1 text-sm'
          aria-expanded={linguisticSectionOpen}
          data-testid='expressions-linguistic-section'
          onClick={() => setLinguisticSectionOpen((open) => !open)}
        >
          {linguisticSectionOpen ? (
            <ChevronDown className='h-4 w-4' />
          ) : (
            <ChevronRight className='h-4 w-4' />
          )}
          Linguistic constructions
        </button>
        {linguisticSectionOpen && (
          <div className='mb-2 space-y-2'>
            <p className='text-xs text-stone-500'>
              Tick two or more boxes to combine linguistic constructions. An expressive
              function is optional.
            </p>
            {combinedLinguistic.length > 0 && (
              <div className='flex flex-wrap gap-1' data-testid='expressions-combined'>
                {combinedLinguistic.map((item) => (
                  <button
                    key={item.key}
                    type='button'
                    className='rounded bg-sky-100 px-1.5 py-0.5 text-xs text-sky-900'
                    onClick={() => toggleCombine(item.group, item.child)}
                  >
                    {formatSelection(item)} ×
                  </button>
                ))}
              </div>
            )}
            <Button
              type='button'
              size='sm'
              variant='secondary'
              data-testid='expressions-create-combine'
              disabled={!language || combinedLinguistic.length < 2 || creating}
              onClick={createCombinedSentence}
            >
              {creatingCombine ? 'Creating…' : 'Create combined sentence'}
            </Button>
          </div>
        )}
        {linguisticSectionOpen && (
          <GroupTiles
            groups={linguisticGroups}
            selection={linguisticSelection}
            combineKeys={combinedLinguistic.map((item) => item.key)}
            onToggleCombine={toggleCombine}
            onSelectGroup={(group) =>
              setLinguisticSelection((current) => selectGroup(current, group))
            }
            onSelectChild={(group, child) =>
              setLinguisticSelection((current) => selectChild(current, group, child))
            }
            testIdPrefix='linguistic'
            expandRequest={linguisticExpand}
          />
        )}
      </section>
    </div>
  );
};

export default ExpressionsWorkspace;
