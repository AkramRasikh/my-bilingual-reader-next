'use client';

import { pinyin } from 'pinyin-pro';
import { chinese, LanguageEnum } from '@/app/languages';
import { Vocab } from '@/app/types/content-types';
import getColorByIndex from '@/utils/get-color-by-index';
import { PLAYBACK_CAPTION_PLATE_CLASS } from './playbackCaptionSurface';
import useLearningScreen from './useLearningScreen';

export type OverlayRailWord = {
  surfaceForm: string;
  meaning: string;
  index: number;
};

export function wordsForOverlayRail(
  sentenceStructure: string | undefined,
  vocab: Vocab[] | undefined,
): OverlayRailWord[] {
  if (!sentenceStructure) return [];

  return (vocab ?? []).flatMap((item, index) => {
    const surfaceForm = item.surfaceForm?.trim();
    if (!surfaceForm || item.meaning === 'n/a') return [];
    return [{ surfaceForm, meaning: item.meaning, index }];
  });
}

const LearningScreenOverlayWordRail = ({
  languageSelectedState,
}: {
  languageSelectedState: LanguageEnum;
}) => {
  const { masterPlayComprehensive } = useLearningScreen();
  const words = wordsForOverlayRail(
    masterPlayComprehensive?.sentenceStructure,
    masterPlayComprehensive?.vocab,
  );

  if (words.length === 0) return null;

  const showPinyin = languageSelectedState === chinese;

  return (
    <div
      data-testid='learning-screen-overlay-word-rail'
      className='pointer-events-none absolute top-[10%] bottom-[10%] left-[3%] z-20 flex w-fit max-w-[9rem] flex-col gap-1 overflow-y-auto'
    >
      {words.map((word) => {
        const color = getColorByIndex(word.index);
        const reading = showPinyin
          ? pinyin(word.surfaceForm, {
              toneType: 'symbol',
              separator: '\u2009',
            })
          : '';

        return (
          <div
            key={`${word.index}-${word.surfaceForm}`}
            data-testid='learning-screen-overlay-word-rail-item'
            className={`w-fit max-w-full px-1.5 py-1 ${PLAYBACK_CAPTION_PLATE_CLASS}`}
            style={{ color }}
          >
            <span
              data-testid='learning-screen-overlay-word-rail-surface'
              className='block text-sm leading-tight'
            >
              {word.surfaceForm}
            </span>
            {reading ? (
              <span
                data-testid='learning-screen-overlay-word-rail-pinyin'
                className='mt-0.5 block text-[10px] leading-tight'
              >
                {reading}
              </span>
            ) : null}
            <span
              data-testid='learning-screen-overlay-word-rail-meaning'
              className='mt-0.5 block break-words text-[10px] leading-tight'
            >
              {word.meaning}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default LearningScreenOverlayWordRail;
