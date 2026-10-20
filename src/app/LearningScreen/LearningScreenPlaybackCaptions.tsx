'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  useFetchData,
  type HandleSaveWordCallTypes,
} from '@/app/Providers/FetchDataProvider';
import { TargetLangFormattedChunk } from '@/app/types/content-types';
import HighlightedText from '@/components/custom/HighlightedText';
import getColorByIndex from '@/utils/get-color-by-index';
import {
  PLAYBACK_CAPTION_PLATE_CLASS,
  PLAYBACK_CAPTION_SECONDARY_TEXT_CLASS,
} from './playbackCaptionSurface';
import {
  BreakdownSavedWord,
  ColoredPhraseBreakdown,
  breakdownPieceSaveHandler,
} from './ReviewSentenceOverlayText';
import { SentenceBreakdownOverlayBrick } from './SentenceBreakdownOverlayBrick';
import { playbackCaptionBottom } from './captionLift';
import useLearningScreen from './useLearningScreen';

export type PlaybackCaptionSentence = {
  id?: string;
  targetLang: string;
  baseLang: string;
  meaning?: string;
  sentenceStructure?: string;
  time?: number;
  vocab?: Array<{ surfaceForm?: string; meaning?: string }>;
  targetLangformatted?: TargetLangFormattedChunk[];
};

function captionBreakdownPieces(sentence: PlaybackCaptionSentence) {
  if (!sentence.sentenceStructure) return [];
  return (sentence.vocab ?? []).flatMap((item, index) => {
    const surfaceForm = item.surfaceForm?.trim();
    if (!surfaceForm) return [];
    const meaning = item.meaning?.trim() ?? '';
    return [
      {
        surfaceForm,
        index,
        meaning: meaning && meaning.toLowerCase() !== 'n/a' ? meaning : '',
      },
    ];
  });
}

function captionEnglish(sentence: PlaybackCaptionSentence) {
  const meaning = sentence.meaning?.trim() ?? '';
  if (meaning && meaning !== 'n/a') return meaning;
  return sentence.baseLang?.trim() ?? '';
}

const CAPTION_MOVE_MS = 450;

type CaptionBox = {
  left: number;
  top: number;
  width: number;
  height: number;
};

function captionBox(node: HTMLElement): CaptionBox {
  return {
    left: node.offsetLeft,
    top: node.offsetTop,
    width: node.offsetWidth,
    height: node.offsetHeight,
  };
}

function slideCaption(node: HTMLElement, from: CaptionBox, to: CaptionBox) {
  if (!to.height || !from.height || typeof node.animate !== 'function') return;

  const scale = from.height / to.height;
  const dx = from.left + from.width / 2 - (to.left + to.width / 2);
  const dy = from.top + from.height / 2 - (to.top + to.height / 2);
  if (Math.abs(dy) < 0.5 && Math.abs(scale - 1) < 0.02) return;

  node.getAnimations?.().forEach((animation) => animation.cancel());
  node.animate(
    [
      { transform: `translate(${dx}px, ${dy}px) scale(${scale})` },
      { transform: 'none' },
    ],
    { duration: CAPTION_MOVE_MS, easing: 'ease', fill: 'both' },
  );
}

function fadeCaptionIn(node: HTMLElement) {
  if (typeof node.animate !== 'function') return;
  node.getAnimations?.().forEach((animation) => animation.cancel());
  node.animate(
    [
      { opacity: 0, transform: 'translateY(8px)' },
      { opacity: 1, transform: 'none' },
    ],
    { duration: CAPTION_MOVE_MS, easing: 'ease', fill: 'both' },
  );
}

function CaptionLine({
  sentence,
  showEnglish,
  testId,
  breakingDown = false,
  reviewed = false,
  showBreakdown = false,
  languageSelectedState = '',
  wordsState,
  onSaveWord,
  originalContext,
}: {
  sentence: PlaybackCaptionSentence;
  showEnglish: boolean;
  testId: string;
  breakingDown?: boolean;
  reviewed?: boolean;
  showBreakdown?: boolean;
  languageSelectedState?: string;
  wordsState?: BreakdownSavedWord[];
  onSaveWord?: (params: HandleSaveWordCallTypes) => void;
  originalContext?: string;
}) {
  const english = captionEnglish(sentence);
  const hasBreakdown = Boolean(sentence.sentenceStructure);
  const pieces = showBreakdown ? captionBreakdownPieces(sentence) : [];
  const wordMeanings = pieces.filter((piece) => piece.meaning);
  const onSavePiece = breakdownPieceSaveHandler({
    onSaveWord,
    sentenceId: sentence.id,
    contextSentence: sentence.targetLang,
    originalContext,
    time: sentence.time,
  });
  const plainCaption = pieces.length === 0;
  const canSelectPlainCaption =
    plainCaption && Boolean(onSaveWord) && Boolean(sentence.id);
  const targetRef = useRef<HTMLParagraphElement>(null);
  const promptRef = useRef<HTMLDivElement>(null);
  const [selectionText, setSelectionText] = useState('');
  const [selectionAnchor, setSelectionAnchor] = useState<{
    left: number;
    top: number;
  } | null>(null);
  const [selectionSaving, setSelectionSaving] = useState(false);

  useEffect(() => {
    if (canSelectPlainCaption) return;
    setSelectionText('');
    setSelectionAnchor(null);
  }, [canSelectPlainCaption]);

  useEffect(() => {
    if (!canSelectPlainCaption) return;

    const handleSelectionEnd = () => {
      const selection = window.getSelection();
      const selectedText = selection?.toString().trim() ?? '';
      const anchorNode = selection?.anchorNode;
      if (!anchorNode || !targetRef.current?.contains(anchorNode)) return;
      if (!selectedText || !selection?.rangeCount) {
        setSelectionText('');
        setSelectionAnchor(null);
        return;
      }
      const rect = selection.getRangeAt(0).getBoundingClientRect();
      const box =
        rect.width || rect.height
          ? rect
          : targetRef.current.getBoundingClientRect();
      setSelectionText(selectedText);
      setSelectionAnchor({
        left: box.left + box.width / 2,
        top: box.top,
      });
    };

    document.addEventListener('mouseup', handleSelectionEnd);
    document.addEventListener('touchend', handleSelectionEnd);
    return () => {
      document.removeEventListener('mouseup', handleSelectionEnd);
      document.removeEventListener('touchend', handleSelectionEnd);
    };
  }, [canSelectPlainCaption]);

  useEffect(() => {
    if (!selectionText) return;

    const handleClickOutside = (event: Event) => {
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (targetRef.current?.contains(target)) return;
      if (promptRef.current?.contains(target)) return;
      setSelectionText('');
      setSelectionAnchor(null);
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside, {
      passive: true,
    });
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [selectionText]);

  const handleSaveSelection = async (isGoogle: boolean) => {
    if (!onSaveWord || !sentence.id || !selectionText) return;
    setSelectionSaving(true);
    try {
      await onSaveWord({
        highlightedWord: selectionText,
        highlightedWordSentenceId: sentence.id,
        contextSentence: sentence.targetLang,
        isGoogle,
        originalContext,
        time: sentence.time,
      });
    } finally {
      setSelectionSaving(false);
      setSelectionText('');
      setSelectionAnchor(null);
      window.getSelection()?.removeAllRanges();
    }
  };

  return (
    <div
      data-caption-id={sentence.id}
      data-caption-role='current'
      data-caption-reviewed={reviewed ? 'on' : 'off'}
      className={`relative overflow-hidden ${breakingDown ? 'opacity-60 ' : ''}${reviewed ? 'border border-amber-500 ' : ''}${hasBreakdown ? 'pl-5 pr-3 ' : 'px-3 '}${PLAYBACK_CAPTION_PLATE_CLASS} max-w-[90%] py-1 text-base`}
    >
      {hasBreakdown ? (
        <span
          data-testid={`${testId}-breakdown-mark`}
          className='pointer-events-none absolute top-1/2 left-1 -translate-y-1/2 text-[10px] leading-none opacity-70'
          aria-hidden
        >
          🧱
        </span>
      ) : null}
      {breakingDown ? <SentenceBreakdownOverlayBrick /> : null}
      {pieces.length > 0 ? (
        <ColoredPhraseBreakdown
          pieces={pieces}
          languageSelectedState={languageSelectedState}
          testId={`${testId}-target`}
          pinyinTestId={`${testId}-pinyin`}
          wordsState={wordsState}
          onSavePiece={onSavePiece}
          sentenceId={sentence.id}
        />
      ) : (
        <>
        <p
          ref={targetRef}
          data-testid={`${testId}-target`}
          className={`leading-tight${canSelectPlainCaption ? ' pointer-events-auto select-text' : ''}`}
        >
          {sentence.targetLangformatted?.length
            ? sentence.targetLangformatted.map((chunk, index) => {
                const saved = chunk.savedWords.length > 0;
                return (
                  <span
                    key={`${index}-${chunk.text}`}
                    style={{
                      textDecorationLine: saved ? 'underline' : 'none',
                    }}
                    data-testid={
                      saved ? `underlined-word-${chunk.text}` : undefined
                    }
                  >
                    {chunk.text}
                  </span>
                );
              })
            : sentence.targetLang}
        </p>
        {selectionText && selectionAnchor
          ? createPortal(
              <div
                ref={promptRef}
                data-testid='playback-caption-highlight-prompt'
                className='pointer-events-auto fixed z-50 w-fit -translate-x-1/2 -translate-y-full pb-2.5'
                style={{
                  left: selectionAnchor.left,
                  top: selectionAnchor.top,
                }}
              >
                <HighlightedText
                  isLoadingState={selectionSaving}
                  handleSaveFunc={handleSaveSelection}
                  highlightedTextState={selectionText}
                  focusIcons
                />
              </div>,
              document.body,
            )
          : null}
        </>
      )}
      {wordMeanings.length > 0 ? (
        <p
          data-testid={`${testId}-word-meanings`}
          className='mt-0.5 flex flex-wrap justify-center gap-x-1 text-xs leading-tight'
        >
          {wordMeanings.map((piece) => (
            <span
              key={`${piece.surfaceForm}-${piece.index}`}
              style={{ color: getColorByIndex(piece.index) }}
            >
              {piece.meaning}
            </span>
          ))}
        </p>
      ) : null}
      {showEnglish && english ? (
        <p
          data-testid={`${testId}-base`}
          className={`mt-0.5 text-xs leading-tight ${PLAYBACK_CAPTION_SECONDARY_TEXT_CLASS}`}
        >
          {english}
        </p>
      ) : null}
    </div>
  );
}

export function PlaybackCaptionStack({
  previous,
  current,
  showEnglish,
  breakingDown = false,
  reviewed = false,
  showBreakdown = false,
  languageSelectedState = '',
  wordsState,
  onSaveWord,
  originalContext,
  liftPercent = 0,
}: {
  previous: PlaybackCaptionSentence | null;
  current: PlaybackCaptionSentence | null;
  showEnglish: boolean;
  breakingDown?: boolean;
  reviewed?: boolean;
  showBreakdown?: boolean;
  languageSelectedState?: string;
  wordsState?: BreakdownSavedWord[];
  onSaveWord?: (params: HandleSaveWordCallTypes) => void;
  originalContext?: string;
  liftPercent?: number;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const boxesRef = useRef(new Map<string, CaptionBox>());
  const lastCurrentIdRef = useRef<string | null>(null);
  const currentTarget = current?.targetLang?.trim() ?? '';
  const layoutKey = `${previous?.id ?? ''}|${current?.id ?? ''}`;

  useLayoutEffect(() => {
    const root = containerRef.current;
    if (!root || !current?.id) return;

    const jumped =
      lastCurrentIdRef.current != null &&
      previous?.id != null &&
      previous.id !== lastCurrentIdRef.current;
    if (jumped) {
      boxesRef.current.clear();
    }

    const reduceMotion = window.matchMedia?.(
      '(prefers-reduced-motion: reduce)',
    )?.matches;
    const nodes = [
      ...root.querySelectorAll<HTMLElement>('[data-caption-id]'),
    ];
    const seen = new Set<string>();

    for (const node of nodes) {
      const id = node.dataset.captionId;
      if (!id) continue;
      seen.add(id);
      const next = captionBox(node);
      const from = boxesRef.current.get(id);
      if (!reduceMotion && from && !jumped) {
        slideCaption(node, from, next);
      } else if (!reduceMotion && !from && node.dataset.captionRole === 'current') {
        fadeCaptionIn(node);
      }
      boxesRef.current.set(id, next);
    }

    for (const id of boxesRef.current.keys()) {
      if (!seen.has(id)) boxesRef.current.delete(id);
    }
    lastCurrentIdRef.current = current.id;
  }, [layoutKey, current?.id, previous?.id]);

  if (!current || !currentTarget) {
    return null;
  }

  const liftedBottom = playbackCaptionBottom(liftPercent);

  return (
    <div
      ref={containerRef}
      data-testid='playback-captions'
      className='pointer-events-none absolute inset-x-0 bottom-2 z-20 flex flex-col items-center gap-2 px-3'
      style={liftedBottom ? { bottom: liftedBottom } : undefined}
    >
      <CaptionLine
        key={current.id ?? 'current'}
        sentence={{ ...current, targetLang: currentTarget }}
        showEnglish={showEnglish}
        testId='playback-caption-current'
        breakingDown={breakingDown}
        reviewed={reviewed}
        showBreakdown={showBreakdown}
        languageSelectedState={languageSelectedState}
        wordsState={wordsState}
        onSaveWord={onSaveWord}
        originalContext={originalContext}
      />
    </div>
  );
}

const LearningScreenPlaybackCaptions = ({
  captionLiftPercent = 0,
}: {
  captionLiftPercent?: number;
}) => {
  const {
    showPlaybackCaptionsState,
    masterPlayComprehensive,
    formattedTranscriptState,
    onlyShowEngState,
    isBreakingDownSentenceArrState,
    playbackCaptionBreakdownId,
    handleSaveWord,
    selectedContentTitleState,
  } = useLearningScreen();
  const { languageSelectedState, wordsState } = useFetchData();

  if (!showPlaybackCaptionsState) {
    return null;
  }

  const index = masterPlayComprehensive?.index;
  const previous =
    typeof index === 'number' && index > 0
      ? (formattedTranscriptState[index - 1] ?? null)
      : null;

  return (
    <PlaybackCaptionStack
      previous={previous}
      current={masterPlayComprehensive ?? null}
      showEnglish={!onlyShowEngState}
      breakingDown={Boolean(
        masterPlayComprehensive?.id &&
          isBreakingDownSentenceArrState.includes(masterPlayComprehensive.id),
      )}
      reviewed={Boolean(masterPlayComprehensive?.reviewData?.due)}
      showBreakdown={
        playbackCaptionBreakdownId === masterPlayComprehensive?.id &&
        Boolean(masterPlayComprehensive?.sentenceStructure)
      }
      languageSelectedState={languageSelectedState}
      wordsState={wordsState}
      onSaveWord={handleSaveWord}
      originalContext={selectedContentTitleState}
      liftPercent={captionLiftPercent}
    />
  );
};

export default LearningScreenPlaybackCaptions;
