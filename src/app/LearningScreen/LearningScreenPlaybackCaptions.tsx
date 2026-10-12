'use client';

import { useLayoutEffect, useRef } from 'react';
import useLearningScreen from './useLearningScreen';

export type PlaybackCaptionSentence = {
  id?: string;
  targetLang: string;
  baseLang: string;
};

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
  compact = false,
  role,
}: {
  sentence: PlaybackCaptionSentence;
  showEnglish: boolean;
  testId: string;
  compact?: boolean;
  role: 'previous' | 'current';
}) {
  const baseLang = sentence.baseLang?.trim() ?? '';

  return (
    <div
      data-caption-id={sentence.id}
      data-caption-role={role}
      className={`relative overflow-hidden rounded-md bg-black/70 text-center text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.85)] ${compact ? 'max-w-[82%] px-2.5 py-0.5 text-sm' : 'max-w-[90%] px-3 py-1 text-base'}`}
    >
      <p data-testid={`${testId}-target`} className='leading-tight'>
        {sentence.targetLang}
      </p>
      {showEnglish && baseLang ? (
        <p
          data-testid={`${testId}-base`}
          className='mt-0.5 text-xs leading-tight text-white/80'
        >
          {baseLang}
        </p>
      ) : null}
    </div>
  );
}

export function PlaybackCaptionStack({
  previous,
  current,
  showEnglish,
}: {
  previous: PlaybackCaptionSentence | null;
  current: PlaybackCaptionSentence | null;
  showEnglish: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const boxesRef = useRef(new Map<string, CaptionBox>());
  const lastCurrentIdRef = useRef<string | null>(null);
  const currentTarget = current?.targetLang?.trim() ?? '';
  const previousTarget = previous?.targetLang?.trim() ?? '';
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

  return (
    <div
      ref={containerRef}
      data-testid='playback-captions'
      className='pointer-events-none absolute inset-x-0 bottom-2 z-20 flex flex-col items-center gap-2 px-3'
    >
      {previous && previousTarget ? (
        <CaptionLine
          key={previous.id ?? 'previous'}
          sentence={previous}
          showEnglish={showEnglish}
          testId='playback-caption-previous'
          compact
          role='previous'
        />
      ) : null}
      <CaptionLine
        key={current.id ?? 'current'}
        sentence={{ ...current, targetLang: currentTarget }}
        showEnglish={showEnglish}
        testId='playback-caption-current'
        role='current'
      />
    </div>
  );
}

const LearningScreenPlaybackCaptions = () => {
  const {
    showPlaybackCaptionsState,
    masterPlayComprehensive,
    formattedTranscriptState,
    onlyShowEngState,
  } = useLearningScreen();

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
    />
  );
};

export default LearningScreenPlaybackCaptions;
