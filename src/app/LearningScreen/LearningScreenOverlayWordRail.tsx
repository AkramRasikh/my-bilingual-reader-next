'use client';

import { pinyin } from 'pinyin-pro';
import { chinese, LanguageEnum } from '@/app/languages';
import { WordTypes } from '@/app/types/word-types';
import getColorByIndex from '@/utils/get-color-by-index';
import { PLAYBACK_CAPTION_PLATE_CLASS } from './playbackCaptionSurface';
import useLearningScreen from './useLearningScreen';

const OVERLAY_RAIL_MEANING_MAX_LENGTH = 40;

export type OverlayRailWord = {
  surfaceForm: string;
  meaning: string;
  reading: string;
  index: number;
};

export function truncateOverlayRailMeaning(meaning: string) {
  if (meaning.length <= OVERLAY_RAIL_MEANING_MAX_LENGTH) return meaning;
  return `${meaning.slice(0, OVERLAY_RAIL_MEANING_MAX_LENGTH - 1)}…`;
}

export function wordsForOverlayRail(
  savedWords: WordTypes[] | undefined,
): OverlayRailWord[] {
  return (savedWords ?? []).flatMap((item, index) => {
    const surfaceForm = item.surfaceForm?.trim();
    if (!surfaceForm) return [];
    return [
      {
        surfaceForm,
        meaning: truncateOverlayRailMeaning(item.definition ?? ''),
        reading: item.transliteration?.trim() ?? '',
        index,
      },
    ];
  });
}

const LearningScreenOverlayWordRail = ({
  languageSelectedState,
}: {
  languageSelectedState: LanguageEnum;
}) => {
  const { masterPlayComprehensive, showWordHintsState } = useLearningScreen();
  const words = showWordHintsState
    ? wordsForOverlayRail(masterPlayComprehensive?.wordsFromSentence)
    : [];

  if (words.length === 0) return null;

  const showPinyin = languageSelectedState === chinese;

  return (
    <div
      data-testid='learning-screen-overlay-word-rail'
      className='pointer-events-none absolute top-[10%] bottom-[10%] left-[3%] z-20 flex w-fit flex-col items-start gap-1 overflow-y-auto'
    >
      {words.map((word) => {
        const color = getColorByIndex(word.index);
        const reading = showPinyin
          ? word.reading ||
            pinyin(word.surfaceForm, {
              toneType: 'symbol',
              separator: '\u2009',
            })
          : '';
        const lineClass = `block w-full break-words px-0.5 py-px text-center leading-tight ${PLAYBACK_CAPTION_PLATE_CLASS}`;

        return (
          <div
            key={`${word.index}-${word.surfaceForm}`}
            data-testid='learning-screen-overlay-word-rail-item'
            className='flex w-[100px] max-w-[100px] flex-col items-center gap-0 overflow-hidden'
            style={{ color }}
          >
            <span
              data-testid='learning-screen-overlay-word-rail-surface'
              className={`${lineClass} text-sm`}
              style={{ color }}
            >
              {word.surfaceForm}
            </span>
            {reading ? (
              <span
                data-testid='learning-screen-overlay-word-rail-pinyin'
                className={`${lineClass} text-xs`}
                style={{ color }}
              >
                {reading}
              </span>
            ) : null}
            {word.meaning ? (
              <span
                data-testid='learning-screen-overlay-word-rail-meaning'
                className={`${lineClass} text-xs`}
                style={{ color }}
              >
                {word.meaning}
              </span>
            ) : null}
          </div>
        );
      })}
    </div>
  );
};

export default LearningScreenOverlayWordRail;
