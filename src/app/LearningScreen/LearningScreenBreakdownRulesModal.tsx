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
import { useBreakdownRules } from '../Providers/useBreakdownRules';

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
                        className='text-sm font-medium text-gray-700'
                        title={group.description}
                      >
                        {group.name}
                      </h4>
                      <ul className='mt-1'>
                        {group.options.map((option) => {
                          const favourited = isEnabled(option.key);
                          const disabled = !favourited && isAtMax;
                          return (
                            <li key={option.key}>
                              <button
                                type='button'
                                disabled={disabled}
                                onClick={() => toggleRule(option.key)}
                                aria-pressed={favourited}
                                title={option.description}
                                data-testid={`breakdown-rule-${option.key}`}
                                className='flex w-full items-center gap-2 rounded px-1 py-0.5 text-left text-sm hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50'
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
