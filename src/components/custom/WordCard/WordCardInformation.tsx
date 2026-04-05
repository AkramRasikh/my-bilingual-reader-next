'use client';

import { useEffect, useMemo, useState } from 'react';

import AnimationWrapper from '../AnimationWrapper';
import WordCardChineseCharacterBreakdown from './experimental/WordCardChineseCharacterBreakdown';
import type { ChineseCharLookupMap } from './experimental/WordCardChineseCharacterBreakdown';
import WordCardJapaneseKanjiBreakdown from './experimental/WordCardJapaneseKanjiBreakdown';
import { extractKanji } from './experimental/utils/kanji-detector';
import WordCardEditState from './WordCardEditState';
import { chinese, japanese } from '@/app/languages';

const WordCardInformation = ({
  baseForm,
  surfaceForm,
  phonetic,
  transliteration,
  definition,
  mnemonic,
  updateWordData,
  wordId,
  languageSelectedState,
}) => {
  const [wordData, setWordData] = useState({
    baseForm,
    surfaceForm,
    phonetic,
    transliteration,
    definition,
    mnemonic,
  });

  // Kanji API payload shape varies; kept loose for WordCardJapaneseKanjiBreakdown
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [kanjiDataState, setKanjiDataState] = useState<any>(null);
  const [chineseCharDataState, setChineseCharDataState] =
    useState<ChineseCharLookupMap | null>(null);

  const isJapanese = languageSelectedState === japanese;
  const isChinese = languageSelectedState === chinese;

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

  const chineseCharsInOrder = useMemo(
    () => extractKanji(wordData.baseForm),
    [wordData.baseForm],
  );
  const uniqueChineseChars = useMemo(
    () => [...new Set(chineseCharsInOrder)],
    [chineseCharsInOrder],
  );

  useEffect(() => {
    setChineseCharDataState(null);
  }, [wordData.baseForm]);

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
        {isJapanese && uniqueSetOfKanj?.length > 0 && (
          <WordCardJapaneseKanjiBreakdown
            kanji={hasKanji}
            uniqueSetOfKanj={uniqueSetOfKanj}
            kanjiDataState={kanjiDataState}
            setKanjiDataState={setKanjiDataState}
            baseForm={wordData.baseForm}
          />
        )}
        {isChinese && uniqueChineseChars.length > 0 && (
          <WordCardChineseCharacterBreakdown
            charsInOrder={chineseCharsInOrder}
            uniqueChars={uniqueChineseChars}
            charDataState={chineseCharDataState}
            setCharDataState={setChineseCharDataState}
            baseForm={wordData.baseForm}
          />
        )}
      </div>
    </AnimationWrapper>
  );
};

export default WordCardInformation;
