import { HammerIcon } from 'lucide-react';
import clsx from 'clsx';
import getColorByIndex from '@/utils/get-color-by-index';

interface SnippetReviewChineseBreakdownWidgetsProps {
  sentencesToBreakdown: Array<{
    sentenceId: string;
    startIndex: number;
    surfaceForm?: string;
  }>;
  isBreakingDownSentenceArrState?: string[];
  handleBreakdownSentence: (arg: { sentenceId: string }) => Promise<void>;
}

const SnippetReviewChineseBreakdownWidgets = ({
  sentencesToBreakdown,
  isBreakingDownSentenceArrState,
  handleBreakdownSentence,
}: SnippetReviewChineseBreakdownWidgetsProps) => {
  if (!sentencesToBreakdown?.length) return null;
  return (
    <div
      className='flex gap-2 flex-col'
      data-testid='breakdown-buttons-container'
    >
      {sentencesToBreakdown.map((sentencedata) => {
        const isThisLoading = isBreakingDownSentenceArrState?.includes(
          sentencedata.sentenceId,
        );
        return (
          <button
            key={sentencedata.sentenceId}
            className={'text-sm'}
            style={{
              color: getColorByIndex(sentencedata.startIndex),
            }}
            onDoubleClick={async () =>
              await handleBreakdownSentence({
                sentenceId: sentencedata.sentenceId,
              })
            }
            data-testid={`breakdown-button-${sentencedata.sentenceId}`}
          >
            <HammerIcon
              className={clsx(
                'mx-auto rounded-4xl',
                isThisLoading ? 'animate-bounce' : '',
              )}
              style={{
                fill: isThisLoading
                  ? getColorByIndex(sentencedata.startIndex)
                  : 'transparent',
              }}
            />
          </button>
        );
      })}
    </div>
  );
};

export default SnippetReviewChineseBreakdownWidgets;
