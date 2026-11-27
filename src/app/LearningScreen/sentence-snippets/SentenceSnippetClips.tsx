'use client';

import { useContext, useEffect, useState } from 'react';
import clsx from 'clsx';
import { X } from 'lucide-react';
import { LearningScreenContext } from '../LearningScreenProvider';
import { getSentenceCoverage } from './sentence-snippet-utils';
import type {
  FocusedSentenceSnippet,
  SentenceSnippetClip,
} from './useSentenceSnippets';

/** Per-clip colours (solid fill for saved, dashed border for drafts). */
const CLIP_COLORS = [
  { fill: 'bg-sky-500', border: 'border-sky-500' },
  { fill: 'bg-emerald-500', border: 'border-emerald-500' },
  { fill: 'bg-violet-500', border: 'border-violet-500' },
  { fill: 'bg-amber-500', border: 'border-amber-500' },
  { fill: 'bg-pink-500', border: 'border-pink-500' },
  { fill: 'bg-teal-500', border: 'border-teal-500' },
];

const toPercent = (time: number, start: number, end: number) => {
  if (!(end > start)) return 0;
  return Math.min(100, Math.max(0, ((time - start) / (end - start)) * 100));
};

/** Media time, refreshed every frame while something on screen moves. */
const useLiveMediaTime = (
  ref: React.RefObject<HTMLVideoElement | HTMLAudioElement | null>,
  active: boolean,
  fallback: number,
) => {
  const [time, setTime] = useState(fallback);
  useEffect(() => {
    if (!active) {
      setTime(ref.current?.currentTime ?? fallback);
      return;
    }
    let frame = 0;
    const tick = () => {
      const now = ref.current?.currentTime;
      if (typeof now === 'number' && Number.isFinite(now)) setTime(now);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [active, ref, fallback]);
  return active ? time : fallback;
};

type Piece = { text: string; inFocus: boolean; dividerBefore: boolean };

/** Split the joined clip text at the focus edges and sentence boundaries. */
export const splitClipText = (
  text: string,
  focus: { start: number; end: number } | null,
  boundaries: number[],
): Piece[] => {
  const cuts = new Set<number>([0, text.length, ...boundaries]);
  if (focus) {
    cuts.add(focus.start);
    cuts.add(focus.end);
  }
  const sorted = [...cuts]
    .filter((cut) => cut >= 0 && cut <= text.length)
    .sort((a, b) => a - b);
  const pieces: Piece[] = [];
  for (let i = 0; i < sorted.length - 1; i += 1) {
    const from = sorted[i];
    const to = sorted[i + 1];
    if (to <= from) continue;
    pieces.push({
      text: text.slice(from, to),
      inFocus: Boolean(focus && from >= focus.start && to <= focus.end),
      dividerBefore: boundaries.includes(from),
    });
  }
  return pieces;
};

const FocusedClipText = ({
  focused,
  variant,
}: {
  focused: FocusedSentenceSnippet;
  variant: 'overlay' | 'row';
}) => {
  const clipText = focused.clipText;
  if (!clipText) return null;
  const pieces = splitClipText(
    clipText.targetLang,
    focused.focus.range,
    clipText.sentenceBoundaries,
  );
  return (
    <p
      data-testid='sentence-snippet-focus-text'
      data-focus-state={focused.focus.isHumanSet ? 'solid' : 'dashed'}
      className={clsx(
        'mt-1 text-center text-sm leading-snug',
        variant === 'overlay' ? 'text-white' : 'text-gray-900',
      )}
    >
      {pieces.map((piece, index) => (
        <span key={`${index}-${piece.text}`}>
          {piece.dividerBefore ? (
            <span
              aria-hidden
              data-testid='sentence-snippet-divider'
              className='mx-1 inline-block h-3 w-px bg-current align-middle opacity-40'
            />
          ) : null}
          <span
            data-testid={piece.inFocus ? 'sentence-snippet-focus' : undefined}
            className={clsx(
              piece.inFocus
                ? focused.focus.isHumanSet
                  ? 'rounded-sm bg-yellow-300 px-0.5 text-gray-900'
                  : 'rounded-sm border border-dashed border-yellow-300 px-0.5'
                : 'opacity-50',
            )}
          >
            {piece.text}
          </span>
        </span>
      ))}
    </p>
  );
};

const ClipBar = ({
  clip,
  coverage,
  isFocused,
  onLoop,
  onDelete,
}: {
  clip: SentenceSnippetClip;
  coverage: { start: number; end: number };
  isFocused: boolean;
  onLoop: () => void;
  onDelete: () => void;
}) => {
  const left = toPercent(clip.start, coverage.start, coverage.end);
  const right = toPercent(clip.end, coverage.start, coverage.end);
  const color = CLIP_COLORS[clip.colorIndex % CLIP_COLORS.length];
  return (
    <div className='relative h-1.5 w-full'>
      <button
        type='button'
        data-testid={`sentence-snippet-bar-${clip.id}`}
        data-kind={clip.kind}
        aria-label={`Loop ${clip.kind === 'draft' ? 'draft ' : ''}sentence snippet`}
        onClick={onLoop}
        className={clsx(
          'absolute top-0 h-1.5 rounded-sm',
          clip.kind === 'draft'
            ? `border-2 border-dashed ${color.border} bg-transparent`
            : color.fill,
          isFocused && 'outline outline-2 outline-offset-1 outline-yellow-300',
        )}
        style={{ left: `${left}%`, width: `${Math.max(1, right - left)}%` }}
      />
      {isFocused ? (
        <button
          type='button'
          aria-label='Delete sentence snippet'
          data-testid={`sentence-snippet-delete-${clip.id}`}
          onClick={onDelete}
          className='absolute top-1/2 z-10 flex size-4 -translate-y-1/2 items-center justify-center rounded-full bg-gray-800 text-white'
          style={{ left: `min(calc(${right}% + 2px), calc(100% - 1rem))` }}
        >
          <X className='size-3' />
        </button>
      ) : null}
    </div>
  );
};

/**
 * Custom sentence snippet bars for the sentence under review: one row per
 * clip, newest on top, placed by its share of the sentence's time. Rendered
 * on whichever review surface the gamepad drives.
 */
const SentenceSnippetClips = ({
  sentenceId,
  variant,
}: {
  sentenceId: string;
  variant: 'overlay' | 'row';
}) => {
  const context = useContext(LearningScreenContext);
  const sentenceSnippets = context?.sentenceSnippets;
  const isLive = Boolean(
    context &&
      sentenceSnippets &&
      (sentenceSnippets.hold || sentenceSnippets.focused || context.isVideoPlaying),
  );
  const liveTime = useLiveMediaTime(
    context?.ref ?? { current: null },
    isLive,
    context?.currentTime ?? 0,
  );

  if (!context || !sentenceSnippets?.canCreate) return null;
  if (sentenceSnippets.reviewSentenceId !== sentenceId) return null;

  const sentence = context.sentenceMapMemoized[sentenceId];
  if (!sentence) return null;

  const { clips, focused, hold } = sentenceSnippets;
  const holdIsHere = hold?.sentenceId === sentenceId;
  if (clips.length === 0 && !holdIsHere) return null;

  const coverage = getSentenceCoverage(sentence, context.mediaDuration);
  const playhead = toPercent(liveTime, coverage.start, coverage.end);
  const showPlayhead = liveTime >= coverage.start && liveTime <= coverage.end;
  const focusedHere =
    focused && focused.clip.sentenceId === sentenceId ? focused : null;

  return (
    <div
      data-testid='sentence-snippet-clips'
      className={clsx(
        'w-full min-w-0 px-1 py-1',
        variant === 'overlay' ? 'max-w-[40rem]' : '',
      )}
    >
      <div className='relative flex flex-col gap-1'>
        {holdIsHere && hold ? (
          <div className='relative h-1.5 w-full'>
            <div
              data-testid='sentence-snippet-hold-bar'
              className='absolute top-0 h-1.5 animate-pulse rounded-sm bg-red-500'
              style={{
                left: `${toPercent(Math.min(hold.pressTime, liveTime), coverage.start, coverage.end)}%`,
                width: `${Math.max(
                  1,
                  Math.abs(
                    toPercent(liveTime, coverage.start, coverage.end) -
                      toPercent(hold.pressTime, coverage.start, coverage.end),
                  ),
                )}%`,
              }}
            />
          </div>
        ) : null}
        {clips.map((clip) => (
          <ClipBar
            key={clip.id}
            clip={clip}
            coverage={coverage}
            isFocused={focusedHere?.clip.id === clip.id}
            onLoop={() => sentenceSnippets.loopClip(clip.id)}
            onDelete={() => void sentenceSnippets.deleteFocused()}
          />
        ))}
        {showPlayhead ? (
          <div
            aria-hidden
            data-testid='sentence-snippet-playhead'
            className={clsx(
              'pointer-events-none absolute inset-y-0 w-px',
              variant === 'overlay' ? 'bg-white' : 'bg-gray-800',
            )}
            style={{ left: `${playhead}%` }}
          />
        ) : null}
      </div>
      {focusedHere ? (
        <>
          <p
            data-testid='sentence-snippet-hint'
            className={clsx(
              'mt-1 text-center text-[10px]',
              variant === 'overlay' ? 'text-white/80' : 'text-gray-600',
            )}
          >
            Y/A focus · {focusedHere.saveHint} · {focusedHere.deleteHint}
          </p>
          <FocusedClipText focused={focusedHere} variant={variant} />
        </>
      ) : null}
    </div>
  );
};

export default SentenceSnippetClips;
