import { useState } from 'react';

import AnimationWrapper from '../AnimationWrapper';
import WordCardJapaneseKanjiBreakdown from './experimental/WordCardJapaneseKanjiBreakdown';
import { extractKanji } from './experimental/utils/kanji-detector';
import WordCardEditState from './WordCardEditState';

const WordCardInformation = ({
  baseForm,
  surfaceForm,
  phonetic,
  transliteration,
  definition,
  mnemonic,
  updateWordData,
  wordId,
}) => {
  const [wordData, setWordData] = useState({
    baseForm,
    surfaceForm,
    phonetic,
    transliteration,
    definition,
    mnemonic,
  });

  const [kanjiDataState, setKanjiDataState] = useState<any>(null);

  const wordDataArr = [
    {
      key: 'baseForm',
      preText: 'BaseForm',
      text: wordData.baseForm,
      label: 'Base Form',
    },
    {
      key: 'surfaceForm',
      label: 'Surface Form',
      text: wordData.surfaceForm,
    },
    {
      key: 'phonetic',
      label: 'Phonetic',
      text: wordData.phonetic,
    },
    {
      key: 'transliteration',
      label: 'Transliteration',
      text: wordData.transliteration,
    },
    {
      key: 'definition',
      label: 'Definition',
      text: wordData.definition,
    },
    {
      key: 'mnemonic',
      label: 'Mnemonic',
      text: wordData.mnemonic,
    },
  ];

  const hasKanji = extractKanji(baseForm);
  const uniqueSetOfKanj = [...new Set(hasKanji)];

  const handleUpdateWordData = async (field: string, newValue: string) => {
    const wordResBool = await updateWordData({
      wordId,
      fieldToUpdate: {
        [field]: newValue,
      },
      isWordData: true,
    });

    if (wordResBool) {
      setWordData((prev) => ({
        ...prev,
        [field]: newValue,
      }));
    }
  };

  return (
    <AnimationWrapper>
      <div className={'flex flex-col gap-1 mb-2 flex-wrap items-start'}>
        {wordDataArr.map(({ key, label }) => {
          return (
            <WordCardEditState
              key={key}
              label={label}
              value={wordData[key]}
              onSave={(newValue) => handleUpdateWordData(key, newValue)}
            />
          );
        })}
        {uniqueSetOfKanj?.length > 0 && (
          <WordCardJapaneseKanjiBreakdown
            kanji={hasKanji}
            uniqueSetOfKanj={uniqueSetOfKanj}
            kanjiDataState={kanjiDataState}
            setKanjiDataState={setKanjiDataState}
            baseForm={wordData.baseForm}
          />
        )}
      </div>
    </AnimationWrapper>
  );
};

export default WordCardInformation;
