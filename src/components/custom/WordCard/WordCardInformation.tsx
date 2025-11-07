import { useState } from 'react';
import AnimationWrapper from '../AnimationWrapper';
import WordCardJapaneseKanjiBreakdown from './experimental/WordCardJapaneseKanjiBreakdown';
import { extractKanji } from './experimental/utils/kanji-detector';

const WordCardInformation = ({
  baseForm,
  surfaceForm,
  phonetic,
  transliteration,
  definition,
}) => {
  const [kanjiDataState, setKanjiDataState] = useState<any>(null);

  const wordDataArr = [
    { preText: 'BaseForm', text: baseForm },
    { preText: 'Surface Form', text: surfaceForm },
    { preText: 'Phonetic', text: phonetic },
    { preText: 'Transliteration', text: transliteration },
    { preText: 'Definition', text: definition },
  ];

  const hasKanji = extractKanji(baseForm);
  const uniqueSetOfKanj = [...new Set(hasKanji)];

  return (
    <AnimationWrapper>
      <div className={'flex flex-col gap-1 mb-2 flex-wrap items-start'}>
        {wordDataArr.map((wordData, index) => {
          return (
            wordData.text && (
              <span key={index} className='text-sm text-left font-medium'>
                {wordData.preText}: {wordData.text}
              </span>
            )
          );
        })}
        {uniqueSetOfKanj?.length > 0 && (
          <WordCardJapaneseKanjiBreakdown
            kanji={hasKanji}
            uniqueSetOfKanj={uniqueSetOfKanj}
            kanjiDataState={kanjiDataState}
            setKanjiDataState={setKanjiDataState}
            baseForm={baseForm}
          />
        )}
      </div>
    </AnimationWrapper>
  );
};

export default WordCardInformation;
