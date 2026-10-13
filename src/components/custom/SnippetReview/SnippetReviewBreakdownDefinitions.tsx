import React from 'react';

interface SnippetReviewBreakdownDefinitionsProps {
  slicedSnippetSegment: Array<{ startIndex?: number; index?: number }>;
  vocab: Record<number, { meaning: string }>;
  getColorByIndex: (index?: number) => string;
  matchStartKey: number;
  matchEndKey: number;
  pinyinStart: number;
  togglableWordDataArrMemo?: Array<{ index?: number; endIndex?: number }>;
  matchStartWordState?: number | null;
  matchWordsHighlghtedState?: number;
  className?: string;
}

const SnippetReviewBreakdownDefinitions: React.FC<
  SnippetReviewBreakdownDefinitionsProps
> = ({
  slicedSnippetSegment,
  vocab,
  getColorByIndex,
  matchStartKey,
  matchEndKey,
  pinyinStart,
  togglableWordDataArrMemo,
  matchStartWordState,
  matchWordsHighlghtedState = 0,
  className,
}) => {
  const matchingWordData =
    matchStartWordState == null
      ? undefined
      : togglableWordDataArrMemo?.[matchStartWordState];
  const matchingEndWord =
    matchStartWordState == null
      ? undefined
      : togglableWordDataArrMemo?.[
          matchStartWordState + matchWordsHighlghtedState
        ];
  const matchingStartIndex = matchingWordData?.index;
  const matchingEndIndex = matchingEndWord?.endIndex;

  const glosses = slicedSnippetSegment.flatMap((item, index) => {
    const prev = slicedSnippetSegment[index - 1];
    const addSpace = index > 0 && item?.startIndex !== prev?.startIndex;
    let correspondingMeaning = vocab[item?.startIndex]?.meaning;
    if (
      correspondingMeaning === 'n/a' ||
      (index > 0 && item?.startIndex === prev?.startIndex)
    ) {
      return [];
    }
    const charIndex =
      typeof item.index === 'number' ? item.index : index + pinyinStart;
    const low = Math.min(matchingStartIndex ?? 0, matchingEndIndex ?? 0);
    const high = Math.max(matchingStartIndex ?? 0, matchingEndIndex ?? 0);
    const animateText =
      matchingStartIndex !== undefined &&
      matchingEndIndex !== undefined &&
      charIndex >= low &&
      charIndex <= high;
    if (
      typeof correspondingMeaning === 'string' &&
      correspondingMeaning.length > 20
    ) {
      correspondingMeaning =
        correspondingMeaning.slice(0, animateText ? 40 : 20) + '…';
    }

    return [
      {
        key: index,
        meaning: correspondingMeaning,
        charIndex,
        addSpace,
        animateText,
        startIndex: item?.startIndex,
        opacity:
          charIndex < matchStartKey || charIndex > matchEndKey ? 0.25 : 1,
        fontStyle:
          charIndex < Math.max(0, matchStartKey - 5) || charIndex > matchEndKey
            ? ('italic' as const)
            : ('bold' as const),
      },
    ];
  });

  const rows: React.ReactNode[] = [];
  for (let index = 0; index < glosses.length; ) {
    const current = glosses[index];
    if (!current.animateText) {
      rows.push(
        <span
          key={current.key}
          style={{
            color: getColorByIndex(current.startIndex),
            opacity: current.opacity,
            fontStyle: current.fontStyle,
            fontSize: '10px',
          }}
        >
          {current.addSpace && ' '}
          {current.meaning}
        </span>,
      );
      index += 1;
      continue;
    }

    const run = [current];
    let next = index + 1;
    while (next < glosses.length && glosses[next].animateText) {
      run.push(glosses[next]);
      next += 1;
    }
    const coversSeveralWords =
      new Set(run.map((part) => part.startIndex)).size > 1;

    rows.push(
      <React.Fragment key={current.key}>
        {current.addSpace && ' '}
        <span
          data-testid='snippet-review-meaning-selected'
          className='inline-block animate-pulse rounded border leading-none'
          style={{
            borderColor: coversSeveralWords
              ? '#52525b'
              : getColorByIndex(current.startIndex),
          }}
        >
          {run.map((part, partIndex) => (
            <span
              key={part.key}
              style={{
                color: getColorByIndex(part.startIndex),
                opacity: part.opacity,
                fontStyle: part.fontStyle,
                fontSize: '10px',
              }}
            >
              {partIndex > 0 && part.addSpace && ' '}
              {part.meaning}
            </span>
          ))}
        </span>
      </React.Fragment>,
    );
    index = next;
  }

  if (!glosses.some((gloss) => gloss.meaning)) return null;

  return (
    <div
      className={className}
      data-testid={className ? 'snippet-overlay-line' : undefined}
    >
      {rows}
    </div>
  );
};

export default SnippetReviewBreakdownDefinitions;
