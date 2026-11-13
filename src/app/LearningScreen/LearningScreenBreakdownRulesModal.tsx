import { Star } from 'lucide-react';
import clsx from 'clsx';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useMemo, useState } from 'react';
import { useBreakdownRules } from '../Providers/useBreakdownRules';
import { RuleCatalogCategory } from '../types/breakdown-rules-types';
import useLearningScreen from './useLearningScreen';
import { tallyBreakdownRuleStructures } from './utils/tally-breakdown-rule-structures';

const tallyBadgeClassName = (count: number) =>
  clsx(
    'ml-auto shrink-0 rounded px-1.5 text-xs tabular-nums',
    count > 0 ? 'bg-blue-100 text-blue-800' : 'text-gray-400',
  );

const TallyBadge = ({ count, testId }: { count: number; testId: string }) => (
  <span data-testid={testId} className={tallyBadgeClassName(count)}>
    {count}
  </span>
);

// Rendered inside DialogContent, which only mounts while the dialog is open,
// so the tally is computed on open rather than tracking every transcript change.
const BreakdownRulesCatalogColumns = ({
  catalog,
  isEnabled,
  isAtMax,
  toggleRule,
}: {
  catalog: RuleCatalogCategory[];
  isEnabled: (key: string) => boolean;
  isAtMax: boolean;
  toggleRule: (key: string) => void;
}) => {
  const { selectedContentState } = useLearningScreen();
  const transcript = selectedContentState?.content;
  const { byRuleKey, byGroupId, sentencesByRuleKey } = useMemo(
    () => tallyBreakdownRuleStructures(transcript ?? [], catalog),
    [transcript, catalog],
  );
  const [expandedRuleKeys, setExpandedRuleKeys] = useState<Set<string>>(
    () => new Set(),
  );
  const toggleExpanded = (key: string) =>
    setExpandedRuleKeys((prev) => {
      const next = new Set(prev);
      if (!next.delete(key)) next.add(key);
      return next;
    });

  return (
    <div className='grid min-h-0 flex-1 gap-4 md:grid-cols-2'>
      {catalog.map((category) => (
        <section
          key={category.category}
          className='flex min-h-0 flex-col'
          data-testid={`breakdown-rules-column-${category.category}`}
        >
          <h3 className='mb-2 font-semibold'>{category.title}</h3>
          <div className='min-h-0 flex-1 overflow-y-auto pr-2'>
            {category.groups.map((group) => (
              <div key={group.id} className='mb-3'>
                <h4
                  className='flex items-center px-1 text-sm font-medium text-gray-700'
                  title={group.description}
                >
                  {group.name}
                  <TallyBadge
                    count={byGroupId[group.id] ?? 0}
                    testId={`breakdown-rule-group-tally-${group.id}`}
                  />
                </h4>
                <ul className='mt-1'>
                  {group.options.map((option) => {
                    const favourited = isEnabled(option.key);
                    const disabled = !favourited && isAtMax;
                    const count = byRuleKey[option.key] ?? 0;
                    const sentences = sentencesByRuleKey[option.key] ?? [];
                    const expanded = expandedRuleKeys.has(option.key);
                    return (
                      <li key={option.key}>
                        <div className='flex items-center gap-2 rounded px-1 py-0.5 text-sm hover:bg-gray-100'>
                          <button
                            type='button'
                            disabled={disabled}
                            onClick={() => toggleRule(option.key)}
                            aria-pressed={favourited}
                            title={option.description}
                            data-testid={`breakdown-rule-${option.key}`}
                            className='flex items-center gap-2 text-left disabled:cursor-not-allowed disabled:opacity-50'
                          >
                            <Star
                              className={clsx(
                                'size-4 shrink-0',
                                favourited
                                  ? 'fill-yellow-400 text-yellow-500'
                                  : 'text-gray-400',
                              )}
                            />
                            {option.name}
                          </button>
                          <button
                            type='button'
                            disabled={count === 0}
                            onClick={() => toggleExpanded(option.key)}
                            aria-expanded={expanded}
                            aria-label={`Show ${count} sentences matching ${option.name}`}
                            data-testid={`breakdown-rule-tally-${option.key}`}
                            className={clsx(
                              tallyBadgeClassName(count),
                              count > 0 && 'cursor-pointer hover:bg-blue-200',
                              expanded && 'ring-1 ring-blue-400',
                            )}
                          >
                            {count}
                          </button>
                        </div>
                        {expanded && (
                          <ul
                            data-testid={`breakdown-rule-sentences-${option.key}`}
                            className='mx-1 mt-1 mb-2 max-h-48 space-y-1 overflow-y-auto rounded border border-gray-200 bg-gray-50 p-2 text-xs'
                          >
                            {sentences.map((sentence) => (
                              <li key={sentence.id}>
                                <p className='text-gray-900'>
                                  {sentence.targetLang}
                                </p>
                                <p className='text-gray-500'>
                                  {sentence.meaning}
                                </p>
                                <p className='text-gray-500'>
                                  {sentence.structures
                                    ?.map((s) => s)
                                    .join(', ')}
                                </p>
                              </li>
                            ))}
                          </ul>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
};

const LearningScreenBreakdownRulesModal = () => {
  const {
    catalog,
    catalogStatus,
    reloadCatalog,
    enabledRuleKeys,
    isEnabled,
    toggleRule,
    setRules,
    maxRules,
  } = useBreakdownRules();
  const isAtMax = enabledRuleKeys.length >= maxRules;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          type='button'
          variant='ghost'
          size='icon'
          className='relative size-8 text-base'
          aria-label='Breakdown rules'
          title='Favourite rules to detect in sentence breakdowns'
          data-testid='breakdown-rules-toggle'
        >
          🧩
          {enabledRuleKeys.length > 0 && (
            <span className='absolute -top-1 -right-1 rounded-full bg-blue-600 px-1 text-[10px] leading-4 text-white'>
              {enabledRuleKeys.length}
            </span>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className='flex max-h-[85vh] flex-col sm:max-w-5xl'>
        <DialogHeader>
          <DialogTitle>Breakdown rules</DialogTitle>
          <DialogDescription>
            Favourited rules are checked whenever a sentence is broken down (
            {enabledRuleKeys.length}/{maxRules}).
          </DialogDescription>
        </DialogHeader>

        {catalogStatus === 'error' ? (
          <div className='flex items-center gap-2 text-sm text-red-700'>
            Couldn&apos;t load rules.
            <Button size='sm' variant='outline' onClick={reloadCatalog}>
              Retry
            </Button>
          </div>
        ) : catalog.length === 0 ? (
          <p className='text-sm text-gray-500'>Loading rules…</p>
        ) : (
          <BreakdownRulesCatalogColumns
            catalog={catalog}
            isEnabled={isEnabled}
            isAtMax={isAtMax}
            toggleRule={toggleRule}
          />
        )}

        <div className='flex justify-end'>
          <Button
            variant='outline'
            disabled={enabledRuleKeys.length === 0}
            onClick={() => setRules([])}
          >
            Clear favourites
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LearningScreenBreakdownRulesModal;
