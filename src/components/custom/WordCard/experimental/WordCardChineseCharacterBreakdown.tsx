'use client';

import getColorByIndex from '@/utils/get-color-by-index';
import type { DictionaryEntry } from 'cc-cedict';
import { convert } from 'pinyin-pro';
import type { Dispatch, SetStateAction } from 'react';
import { useEffect, useState } from 'react';

export type ChineseCharLookupMap = Record<
  string,
  {
    simplified: string;
    traditional: string;
    pinyinDisplay: string;
    english: string;
  } | null
>;

function formatPinyinForDisplay(pinyinWithToneNumbers: string): string {
  try {
    return convert(pinyinWithToneNumbers, { format: 'numToSymbol' });
  } catch {
    return pinyinWithToneNumbers;
  }
}

function mergeEntriesForCharacter(entries: DictionaryEntry[]): {
  simplified: string;
  traditional: string;
  pinyinDisplay: string;
  english: string;
} | null {
  if (!entries.length) return null;
  const englishParts = [
    ...new Set(entries.flatMap((e) => e.english).filter(Boolean)),
  ];
  const primary = entries[0];
  return {
    simplified: primary.simplified,
    traditional: primary.traditional,
    pinyinDisplay: formatPinyinForDisplay(primary.pinyin),
    english: englishParts.join('; '),
  };
}

const WordCardChineseCharacterBreakdown = ({
  uniqueChars,
  charsInOrder,
  charDataState,
  setCharDataState,
  baseForm,
}: {
  uniqueChars: string[];
  charsInOrder: string[];
  charDataState: ChineseCharLookupMap | null;
  setCharDataState: Dispatch<SetStateAction<ChineseCharLookupMap | null>>;
  baseForm: string;
}) => {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const uniqueLookupKey = uniqueChars.join('\u0000');

  useEffect(() => {
    if (!uniqueLookupKey.length) {
      return;
    }

    const charsToLookup = uniqueLookupKey.split('\u0000');

    let cancelled = false;

    const run = async () => {
      setError(null);
      setLoading(true);

      try {
        const { default: cedict } = await import('cc-cedict');

        const combined: ChineseCharLookupMap = {};

        for (const ch of charsToLookup) {
          if (cancelled) return;
          const raw = cedict.getBySimplified(ch, null, {
            asObject: false,
            allowVariants: true,
          });
          const list = Array.isArray(raw) ? raw : [];
          combined[ch] = mergeEntriesForCharacter(list);
        }

        if (!cancelled) {
          setCharDataState(combined);
        }
      } catch (err: unknown) {
        console.error(err);
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Error loading CC-CEDICT');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [uniqueLookupKey, setCharDataState]);

  const charColorCode = Object.assign(
    {},
    ...charsInOrder.map((charItem, index) => ({
      [charItem]: getColorByIndex(index),
    })),
  );

  const splitBaseForm = baseForm.split('').map((charItem, index) => {
    const color = charColorCode[charItem];
    return (
      <span key={index} style={{ color: color ?? undefined }}>
        {charItem}
      </span>
    );
  });

  return (
    <div className='mx-auto flex flex-col gap-1'>
      <p className='text-center text-xl font-medium'>{splitBaseForm}</p>
      {loading && (
        <p className='text-center text-sm text-gray-500'>Loading dictionary…</p>
      )}
      {error && <p className='text-center text-sm text-red-600'>{error}</p>}
      <ul className='flex flex-row gap-2 justify-center flex-wrap'>
        {charsInOrder.map((charItem, index) => {
          const row = charDataState?.[charItem];
          const color = getColorByIndex(index);

          return (
            <li
              key={`${charItem}-${index}`}
              className='flex flex-col gap-0.5 items-center px-2 py-1 rounded-md shadow-sm min-w-[5.5rem]'
              style={{ border: `2px solid ${color}` }}
            >
              <span style={{ color, fontWeight: 'bold', fontSize: '1.25rem' }}>
                {charItem}
              </span>
              {row?.pinyinDisplay && (
                <span
                  className='text-xs text-gray-600'
                  style={{ fontFamily: 'system-ui, sans-serif' }}
                >
                  {row.pinyinDisplay}
                </span>
              )}
              {row?.english && (
                <span
                  className='text-sm text-gray-700 text-ellipsis'
                  title={row.english}
                  style={{
                    overflow: 'hidden',
                    maxWidth: '18ch',
                  }}
                >
                  {row.english.length > 30
                    ? `${row.english.substring(0, 30)}…`
                    : row.english}
                </span>
              )}
              {!row && charDataState && !loading && (
                <span className='text-xs text-gray-400'>No entry</span>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default WordCardChineseCharacterBreakdown;
