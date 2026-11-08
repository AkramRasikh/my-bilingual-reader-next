'use client';

import { useMemo, useReducer, useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import LanguageSelector from '@/components/custom/LanguageSelector';
import { LanguageEnum } from '@/app/languages';
import { WordTypes } from '@/app/types/word-types';
import { SentenceTypes } from '@/app/types/sentence-types';
import { ContentStateTypes } from '@/app/reducers/content-reducer';
import {
  categoriesInOrder,
  categoryLabel,
  constraintExampleCopy,
  linguisticConstraints,
  type ConstraintExampleCopy,
  type LinguisticConstraint,
} from './constraints';
import {
  addHardItem,
  anotherWord,
  dismissWord,
  emptySession,
  endSession,
  nextConstraint,
  removeHardItem,
  restoreWord,
  SESSION_WORD_COUNT,
  skipConstraint,
  startSession,
  visibleWordIds,
  type HardListItem,
  type ImprovConfig,
  type ImprovSession,
} from './improv-session';
import {
  findSentenceWindow,
  type SentenceWindow,
} from './sentence-window';

interface ImprovWorkspaceProps {
  language: LanguageEnum;
  onLanguageChange: (language: LanguageEnum) => void;
  words: WordTypes[];
  contentState: ContentStateTypes[];
  sentencesState: SentenceTypes[];
}

type ImprovAction =
  | { type: 'start'; words: WordTypes[]; config: ImprovConfig }
  | { type: 'next' }
  | { type: 'skip' }
  | { type: 'hard-word'; wordId: string }
  | { type: 'hard-constraint' }
  | { type: 'dismiss'; wordId: string }
  | { type: 'restore'; wordId: string }
  | { type: 'another' }
  | { type: 'remove-hard'; item: HardListItem }
  | { type: 'end' };

const improvReducer = (
  state: ImprovSession,
  action: ImprovAction,
): ImprovSession => {
  switch (action.type) {
    case 'start':
      return startSession(
        action.words,
        linguisticConstraints,
        action.config,
        Math.random,
      );
    case 'next':
      return nextConstraint(state, linguisticConstraints, Math.random);
    case 'skip':
      return skipConstraint(state, linguisticConstraints, Math.random);
    case 'hard-word':
      return addHardItem(state, { type: 'word', id: action.wordId });
    case 'hard-constraint':
      return state.currentConstraintId
        ? addHardItem(state, {
            type: 'constraint',
            id: state.currentConstraintId,
          })
        : state;
    case 'dismiss':
      return dismissWord(state, action.wordId);
    case 'restore':
      return restoreWord(state, action.wordId);
    case 'another':
      return anotherWord(state);
    case 'remove-hard':
      return removeHardItem(state, action.item);
    case 'end':
      return endSession();
    default:
      return state;
  }
};

const wordLabel = (word: WordTypes | undefined, fallbackId: string) =>
  word?.surfaceForm || word?.baseForm || fallbackId;

const ExampleCopy = ({ copy }: { copy: ConstraintExampleCopy }) => (
  <div className='space-y-1 text-sm'>
    <p>
      <span className='text-muted-foreground'>{copy.primaryLabel}. </span>
      {copy.primary}
    </p>
    {copy.english && (
      <p>
        <span className='text-muted-foreground'>English. </span>
        {copy.english}
      </p>
    )}
  </div>
);

const SentenceLines = ({ sentenceWindow }: { sentenceWindow: SentenceWindow }) => {
  if (!sentenceWindow.previous && !sentenceWindow.current && !sentenceWindow.next) {
    return <p className='text-sm text-muted-foreground'>No example sentence.</p>;
  }

  return (
    <div className='space-y-1 text-sm'>
      {sentenceWindow.previous && (
        <p>
          <span className='text-muted-foreground'>Previous. </span>
          {sentenceWindow.previous}
        </p>
      )}
      {sentenceWindow.current && (
        <p className='font-medium'>{sentenceWindow.current}</p>
      )}
      {sentenceWindow.next && (
        <p>
          <span className='text-muted-foreground'>Next. </span>
          {sentenceWindow.next}
        </p>
      )}
    </div>
  );
};

const ImprovWorkspace = ({
  language,
  onLanguageChange,
  words,
  contentState,
  sentencesState,
}: ImprovWorkspaceProps) => {
  const categories = useMemo(
    () => categoriesInOrder(linguisticConstraints),
    [],
  );
  const [scenario, setScenario] = useState('');
  const [enabledCategories, setEnabledCategories] = useState(categories);
  const [weightingEnabled, setWeightingEnabled] = useState(false);
  const [session, dispatch] = useReducer(improvReducer, undefined, emptySession);

  const wordsById = useMemo(
    () => new Map(words.map((word) => [word.id, word])),
    [words],
  );
  const constraintsById = useMemo(
    () =>
      new Map(
        linguisticConstraints.map((constraint) => [constraint.id, constraint]),
      ),
    [],
  );

  const currentConstraint = session.currentConstraintId
    ? constraintsById.get(session.currentConstraintId)
    : undefined;
  const shownWordIds = visibleWordIds(session);
  const eligibleCount = session.poolWordIds.filter(
    (id) => !session.dismissedWordIds.includes(id),
  ).length;
  const firstShown = shownWordIds.length
    ? session.poolWordIds
        .filter((id) => !session.dismissedWordIds.includes(id))
        .indexOf(shownWordIds[0]) + 1
    : 0;
  const sessionWordCount = Math.min(SESSION_WORD_COUNT, words.length);
  const constraintAlreadyHard = session.hardItems.some(
    (item) =>
      item.type === 'constraint' && item.id === session.currentConstraintId,
  );

  const toggleCategory = (category: string, checked: boolean) => {
    setEnabledCategories((current) => {
      if (checked) {
        return categories.filter(
          (item) => current.includes(item) || item === category,
        );
      }
      if (current.length === 1) return current;
      return current.filter((item) => item !== category);
    });
  };

  const handleStart = () => {
    dispatch({
      type: 'start',
      words,
      config: {
        enabledCategories,
        weightingEnabled,
        wordLimit: SESSION_WORD_COUNT,
      },
    });
  };

  return (
    <div className='flex h-[calc(100dvh-6.5rem)] min-h-0 flex-col gap-3'>
      <div className='flex min-h-0 shrink-0 gap-3'>
      <main className='min-w-0 flex-1 space-y-3 overflow-y-auto pr-1'>
        <div className='space-y-1'>
          <Label htmlFor='improv-scenario'>Scenario (optional)</Label>
          <Textarea
            id='improv-scenario'
            data-testid='improv-scenario'
            value={scenario}
            onChange={(event) => setScenario(event.target.value)}
            placeholder='Two strangers have boarded the wrong train.'
            rows={1}
            className='field-sizing-fixed h-8 min-h-0 resize-none bg-card py-1'
          />
        </div>

        {session.started ? (
          <Button
            type='button'
            variant='outline'
            data-testid='improv-end'
            onClick={() => dispatch({ type: 'end' })}
          >
            End session
          </Button>
        ) : (
          <Button
            type='button'
            data-testid='improv-start'
            onClick={handleStart}
          >
            Start
          </Button>
        )}
      </main>
      <aside
        className='w-72 max-w-[40%] shrink-0 overflow-y-auto border-l pl-3'
        data-testid='improv-hard-list'
      >
        <h2 className='mb-2 text-sm font-semibold'>Hard List</h2>
        {session.hardItems.length === 0 ? (
          <p className='text-sm text-muted-foreground'>
            Nothing marked hard yet.
          </p>
        ) : (
          <ul className='space-y-2'>
            {session.hardItems.map((item) => (
              <li
                key={`${item.type}-${item.id}`}
                className='rounded-lg border bg-card p-2'
              >
                <div className='flex items-start justify-between gap-2'>
                  <div className='min-w-0'>
                    <p className='text-xs text-muted-foreground'>
                      {item.type === 'word' ? 'Word' : 'Constraint'}
                    </p>
                    <p className='font-medium break-words'>
                      {item.type === 'word'
                        ? wordLabel(wordsById.get(item.id), item.id)
                        : constraintsById.get(item.id)?.name || item.id}
                    </p>
                  </div>
                  <Button
                    type='button'
                    size='sm'
                    variant='ghost'
                    data-testid={`improv-remove-hard-${item.type}-${item.id}`}
                    onClick={() => dispatch({ type: 'remove-hard', item })}
                  >
                    Remove
                  </Button>
                </div>
                <details className='mt-1 text-sm'>
                  <summary className='cursor-pointer text-muted-foreground'>
                    Details
                  </summary>
                  <div className='mt-1'>
                    {item.type === 'word' ? (
                      <div className='space-y-1'>
                        <p>
                          {wordsById.get(item.id)?.definition ||
                            'No definition.'}
                        </p>
                        <SentenceLines
                          sentenceWindow={findSentenceWindow(
                            wordsById.get(item.id)?.contexts?.[0],
                            contentState,
                            sentencesState,
                          )}
                        />
                      </div>
                    ) : (
                      <HardConstraintDetails
                        constraint={constraintsById.get(item.id)}
                        language={language}
                      />
                    )}
                  </div>
                </details>
              </li>
            ))}
          </ul>
        )}
      </aside>
      </div>
      {session.started && (
        <div className='min-h-0 flex-1 space-y-3 overflow-y-auto'>
          <section
            className='w-fit max-w-2xl rounded-xl border-2 border-foreground/80 bg-card p-4 shadow-sm'
            data-testid='improv-constraint'
          >
            {currentConstraint ? (
              <ConstraintCard
                constraint={currentConstraint}
                language={language}
              />
            ) : (
              <p className='text-sm text-muted-foreground'>
                No constraint matches the categories chosen for this session.
              </p>
            )}
            <div className='mt-4 flex flex-wrap gap-2'>
              <Button
                type='button'
                data-testid='improv-next'
                disabled={!currentConstraint}
                onClick={() => dispatch({ type: 'next' })}
              >
                Next
              </Button>
              <Button
                type='button'
                variant='outline'
                data-testid='improv-skip'
                disabled={!currentConstraint}
                onClick={() => dispatch({ type: 'skip' })}
              >
                Skip
              </Button>
              <Button
                type='button'
                variant='secondary'
                data-testid='improv-hard-constraint'
                disabled={!currentConstraint || constraintAlreadyHard}
                onClick={() => dispatch({ type: 'hard-constraint' })}
              >
                Hard
              </Button>
            </div>
          </section>
          <section data-testid='improv-words'>
            {shownWordIds.length > 0 ? (
              <div className='space-y-2'>
                <div className='flex items-center justify-between gap-2'>
                  <span className='text-xs text-muted-foreground'>
                    {firstShown}–{firstShown + shownWordIds.length - 1} of{' '}
                    {eligibleCount}
                  </span>
                  <Button
                    type='button'
                    size='sm'
                    variant='outline'
                    data-testid='improv-another-word'
                    onClick={() => dispatch({ type: 'another' })}
                    disabled={eligibleCount <= shownWordIds.length}
                  >
                    Next words
                  </Button>
                </div>
                <ul className='flex items-start gap-2'>
                  {shownWordIds.map((wordId) => {
                    const word = wordsById.get(wordId);
                    const wordIsHard = session.hardItems.some(
                      (item) => item.type === 'word' && item.id === wordId,
                    );
                    return (
                      <li
                        key={wordId}
                        className='h-fit min-w-0 flex-1 rounded-lg border bg-card px-2 py-1.5'
                        data-testid='improv-word'
                      >
                        <p className='font-semibold break-words'>
                          {wordLabel(word, wordId)}
                        </p>
                        {word?.phonetic && (
                          <p className='text-xs break-words text-muted-foreground'>
                            {word.phonetic}
                          </p>
                        )}
                        {word?.baseForm && word.baseForm !== word.surfaceForm && (
                          <p className='text-xs break-words text-muted-foreground'>
                            {word.baseForm}
                          </p>
                        )}
                        <p className='text-sm break-words'>
                          {word?.definition || 'No definition.'}
                        </p>
                        {word?.originalContext && (
                          <p className='text-xs break-words text-muted-foreground'>
                            {word.originalContext}
                          </p>
                        )}
                        <details className='text-sm'>
                          <summary className='cursor-pointer text-muted-foreground'>
                            Example
                          </summary>
                          <div className='mt-1'>
                            <SentenceLines
                              sentenceWindow={findSentenceWindow(
                                word?.contexts?.[0],
                                contentState,
                                sentencesState,
                              )}
                            />
                          </div>
                        </details>
                        <div className='mt-2 flex flex-wrap gap-1'>
                          <Button
                            type='button'
                            size='sm'
                            className='h-7 px-2'
                            variant='outline'
                            data-testid={`improv-dismiss-${wordId}`}
                            onClick={() => dispatch({ type: 'dismiss', wordId })}
                          >
                            Dismiss
                          </Button>
                          <Button
                            type='button'
                            size='sm'
                            className='h-7 px-2'
                            variant='secondary'
                            data-testid={`improv-hard-word-${wordId}`}
                            disabled={wordIsHard}
                            onClick={() => dispatch({ type: 'hard-word', wordId })}
                          >
                            Hard
                          </Button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ) : (
              <p className='text-sm text-muted-foreground'>
                No vocabulary left in this exercise.
              </p>
            )}
            {session.dismissedWordIds.length > 0 && (
              <ul className='mt-2 flex flex-wrap gap-2 text-sm'>
                {session.dismissedWordIds.map((wordId) => (
                  <li
                    key={wordId}
                    className='flex items-center gap-1 rounded-md border bg-card px-2 py-1'
                  >
                    <span className='break-words'>
                      {wordLabel(wordsById.get(wordId), wordId)}
                    </span>
                    <Button
                      type='button'
                      size='sm'
                      variant='ghost'
                      data-testid={`improv-restore-${wordId}`}
                      onClick={() => dispatch({ type: 'restore', wordId })}
                    >
                      Restore
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      )}
      <details className='mt-auto shrink-0 rounded-lg border bg-card px-3 py-2 text-sm'>
        <summary className='cursor-pointer font-medium'>Setup</summary>
        <div className='mt-3 space-y-3'>
          <div className='flex items-center gap-2'>
            <span>Language</span>
            <LanguageSelector
              defaultValue={language}
              onChange={onLanguageChange}
            />
          </div>
          <fieldset className='space-y-2'>
            <legend className='font-medium'>Categories</legend>
            {categories.map((category) => {
              const checked = enabledCategories.includes(category);
              const inputId = `improv-category-${category}`;
              return (
                <div key={category} className='flex items-center gap-2'>
                  <Checkbox
                    id={inputId}
                    checked={checked}
                    disabled={checked && enabledCategories.length === 1}
                    onCheckedChange={(value) =>
                      toggleCategory(category, value === true)
                    }
                  />
                  <Label htmlFor={inputId}>{categoryLabel(category)}</Label>
                </div>
              );
            })}
          </fieldset>
          <div className='flex items-center gap-2'>
            <Switch
              id='improv-weighting'
              checked={weightingEnabled}
              onCheckedChange={setWeightingEnabled}
            />
            <Label htmlFor='improv-weighting'>Weight constraints</Label>
          </div>
          <p className='text-muted-foreground'>
            {words.length === 0
              ? 'No saved words for this language.'
              : `Each session uses ${sessionWordCount} words.`}
          </p>
        </div>
      </details>
    </div>
  );
};

const ConstraintCard = ({
  constraint,
  language,
}: {
  constraint: LinguisticConstraint;
  language: LanguageEnum;
}) => (
  <div className='space-y-2'>
    <p className='text-xs font-medium tracking-wide text-muted-foreground uppercase'>
      {categoryLabel(constraint.category)}
    </p>
    <h2 className='text-2xl font-semibold'>{constraint.name}</h2>
    <p>{constraint.instruction}</p>
    <div>
      <p className='text-xs text-muted-foreground'>Example</p>
      <ExampleCopy copy={constraintExampleCopy(constraint, language)} />
    </div>
  </div>
);

const HardConstraintDetails = ({
  constraint,
  language,
}: {
  constraint: LinguisticConstraint | undefined;
  language: LanguageEnum;
}) => {
  if (!constraint) return <p>This constraint is no longer in the library.</p>;
  return (
    <div className='space-y-1'>
      <p className='text-xs text-muted-foreground'>
        {categoryLabel(constraint.category)}
      </p>
      <p>{constraint.instruction}</p>
      <ExampleCopy copy={constraintExampleCopy(constraint, language)} />
    </div>
  );
};

export default ImprovWorkspace;
