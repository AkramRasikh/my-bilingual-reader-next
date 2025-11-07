import getColorByIndex from '@/utils/get-color-by-index';
import { useEffect, useState } from 'react';

const WordCardJapaneseKanjiBreakdown = ({
  uniqueSetOfKanj,
  kanji,
  kanjiDataState,
  setKanjiDataState,
  baseForm,
}) => {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGetKanjiArray = async () => {
    if (!uniqueSetOfKanj.length || kanjiDataState) {
      setError('Please enter at least one kanji character.');
      return;
    }

    setError(null);
    setLoading(true);
    setKanjiDataState(null);

    try {
      // Fetch all kanji data in parallel
      const results = await Promise.all(
        uniqueSetOfKanj.map(async (k) => {
          const res = await fetch(`https://kanjiapi.dev/v1/kanji/${k}`);
          if (!res.ok) throw new Error(`Kanji ${k} not found`);
          const json = await res.json();
          return { [k]: json };
        }),
      );

      // Merge array of objects into one object
      const combined = results.reduce((acc, curr) => ({ ...acc, ...curr }), {});

      // Example: { "日": {...}, "本": {...}, "語": {...} }
      setKanjiDataState(combined);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error fetching data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!kanjiDataState) {
      handleGetKanjiArray();
    }
  }, []);

  const kanjiColorCode = Object.assign(
    {},
    ...kanji.map((kanjiItem, index) => ({
      [kanjiItem]: getColorByIndex(index),
    })),
  );

  const splitBaseForm = baseForm.split('').map((baseFormItem, index) => {
    const isKanjiColorCoded = kanjiColorCode[baseFormItem];
    return (
      <span key={index} style={{ color: isKanjiColorCoded }}>
        {baseFormItem}
      </span>
    );
  });

  return (
    <div className='mx-auto flex flex-col gap-1'>
      <p className='text-center text-xl font-medium'>{splitBaseForm}</p>
      <ul className='flex flex-row gap-2 justify-center flex-wrap'>
        {kanji.map((kanjiItem, index) => {
          const correspondingEnglishMeaning =
            kanjiDataState?.[kanjiItem]?.meanings;
          const meanings = correspondingEnglishMeaning?.join(', ');
          const color = getColorByIndex(index);

          return (
            <li
              key={index}
              className='flex flex-col gap-1 items-center px-2 py-1 rounded-md shadow-sm'
              style={{ border: `2px solid ${color}` }}
            >
              <span style={{ color, fontWeight: 'bold', fontSize: '1.25rem' }}>
                {kanjiItem}
              </span>
              {correspondingEnglishMeaning && (
                <span
                  className='text-sm text-gray-700 text-ellipsis'
                  style={{
                    overflow: 'hidden',
                    maxWidth: '15ch',
                  }}
                >
                  {meanings}
                </span>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default WordCardJapaneseKanjiBreakdown;
