import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import {
  FormattedTranscriptTypes,
  SentenceMapItemTypes,
  Snippet,
} from '@/app/types/content-types';
import {
  ClipRange,
  ClipText,
  FocusEdit,
  ResolvedFocus,
  SENTENCE_SNIPPET_ALREADY_SAVED_MESSAGE,
  SENTENCE_SNIPPET_NO_BASE_LANG_MESSAGE,
  SENTENCE_SNIPPET_NUDGE_SECONDS,
  SENTENCE_SNIPPET_TOO_SHORT_MESSAGE,
  SENTENCE_SNIPPET_UPDATED_MESSAGE,
  SentenceSnippetDrafts,
  buildSentenceSnippetRecord,
  finalizeHoldRange,
  focusedTextForResave,
  getClipText,
  isSentenceSnippet,
  nudgeClipEdge,
  readSentenceSnippetDrafts,
  resolveClipFocus,
  stepClipFocus,
  writeSentenceSnippetDrafts,
} from './sentence-snippet-utils';
import { sentenceSnippetGamepadBridge } from './sentence-snippet-gamepad-bridge';

/** The plain clip range loop: loops start..end exactly. Not the 3 s loop. */
export type RangeLoopState = ClipRange & {
  clipId: string;
  /**
   * Set when B on a review word started this loop: it just replays the
   * word's custom snippet and does not focus the clip for editing.
   */
  wordId?: string;
};

export type SentenceSnippetClip = ClipRange & {
  id: string;
  kind: 'draft' | 'saved';
  sentenceId: string;
  createdAt?: number;
  snippet?: Snippet;
  /** Saved clip whose times were nudged but not re-saved yet. */
  hasPendingTimes: boolean;
  colorIndex: number;
};

export type FocusedSentenceSnippet = {
  clip: SentenceSnippetClip;
  clipText: ClipText | null;
  focus: ResolvedFocus;
  hasFocusEdit: boolean;
  saveHint: string;
  deleteHint: string;
};

export type SentenceSnippetHold = { pressTime: number; sentenceId: string };

export type SentenceSnippetFocusMove = 'left' | 'right' | 'shrink' | 'grow';

export type SentenceSnippetsApi = {
  /** YouTube content only. */
  enabled: boolean;
  /** A YouTube sentence is the current review item. */
  canCreate: boolean;
  reviewSentenceId: string | null;
  /** Clips of the review sentence, newest first. */
  clips: SentenceSnippetClip[];
  focused: FocusedSentenceSnippet | null;
  hold: SentenceSnippetHold | null;
  holdStart: () => void;
  holdEnd: () => void;
  selectLast: () => void;
  step: (direction: -1 | 1) => void;
  nudge: (edge: 'start' | 'end', direction: -1 | 1) => void;
  moveFocus: (move: SentenceSnippetFocusMove) => void;
  save: () => Promise<void>;
  deleteFocused: () => Promise<void>;
  endLoop: () => void;
  loopClip: (clipId: string) => void;
  playRangeOnce: (start: number, end: number) => void;
  loopWordSnippet: (
    wordId: string,
    clip: ClipRange & { snippetId: string },
  ) => void;
};

export const SENTENCE_SNIPPET_COLOR_COUNT = 6;

const colorIndexForId = (id: string) => {
  let hash = 0;
  for (let i = 0; i < id.length; i += 1) {
    hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  }
  return hash % SENTENCE_SNIPPET_COLOR_COUNT;
};

export const getSaveHint = (
  clip: Pick<SentenceSnippetClip, 'kind' | 'hasPendingTimes'>,
  hasFocusEdit: boolean,
) => {
  if (clip.kind === 'draft') return 'L1+X save';
  if (clip.hasPendingTimes) return 'L1+X save times';
  if (hasFocusEdit) return 'L1+X save focus';
  return '✓ saved';
};

export const getDeleteHint = (
  clip: Pick<SentenceSnippetClip, 'kind'>,
  isArmed: boolean,
) => {
  if (clip.kind === 'draft') return 'L2+R2 delete';
  return isArmed ? 'L2+R2 again to delete' : 'L2+R2 ×2 delete';
};

type UseSentenceSnippetsArgs = {
  ref: React.RefObject<HTMLVideoElement | HTMLAudioElement | null>;
  contentId: string;
  contentOrigin?: string;
  isInReviewMode: boolean;
  reviewSentenceId: string | null;
  /** The review item when it is a word (ends a word-started loop on change). */
  reviewWordId?: string | null;
  contentSnippets: Snippet[];
  sentenceMap: Record<string, SentenceMapItemTypes>;
  secondsState: string[];
  mediaDuration: number | null;
  isTrimmed: boolean;
  rangeLoopState: RangeLoopState | null;
  setRangeLoopState: React.Dispatch<
    React.SetStateAction<RangeLoopState | null>
  >;
  threeSecondLoopState: number | null;
  setThreeSecondLoopState: React.Dispatch<React.SetStateAction<number | null>>;
  loopTranscriptState: FormattedTranscriptTypes[];
  setLoopTranscriptState: React.Dispatch<
    React.SetStateAction<FormattedTranscriptTypes[]>
  >;
  saveSnippet: (snippet: Snippet, isUpdate: boolean) => Promise<boolean>;
  deleteSnippet: (snippetId: string) => Promise<void>;
  notify: (message: string) => void;
};

export const useSentenceSnippets = ({
  ref,
  contentId,
  contentOrigin,
  isInReviewMode,
  reviewSentenceId,
  reviewWordId = null,
  contentSnippets,
  sentenceMap,
  secondsState,
  mediaDuration,
  isTrimmed,
  rangeLoopState,
  setRangeLoopState,
  threeSecondLoopState,
  setThreeSecondLoopState,
  loopTranscriptState,
  setLoopTranscriptState,
  saveSnippet,
  deleteSnippet,
  notify,
}: UseSentenceSnippetsArgs): SentenceSnippetsApi => {
  const enabled = contentOrigin !== 'netflix';
  const canCreate = enabled && isInReviewMode && Boolean(reviewSentenceId);

  const [drafts, setDrafts] = useState<SentenceSnippetDrafts>({});
  const draftsRef = useRef<SentenceSnippetDrafts>({});
  const [pendingTimes, setPendingTimes] = useState<Record<string, ClipRange>>(
    {},
  );
  const [focusEdits, setFocusEdits] = useState<Record<string, FocusEdit>>({});
  const [deleteArmedId, setDeleteArmedId] = useState<string | null>(null);
  const [hold, setHold] = useState<SentenceSnippetHold | null>(null);
  const holdRef = useRef<SentenceSnippetHold | null>(null);
  const isSavingRef = useRef(false);
  const playOnceTokenRef = useRef(0);

  useEffect(() => {
    const loaded = enabled ? readSentenceSnippetDrafts(contentId) : {};
    draftsRef.current = loaded;
    setDrafts(loaded);
    setPendingTimes({});
    setFocusEdits({});
    setDeleteArmedId(null);
  }, [contentId, enabled]);

  const updateDrafts = useCallback(
    (update: (prev: SentenceSnippetDrafts) => SentenceSnippetDrafts) => {
      const next = update(draftsRef.current);
      draftsRef.current = next;
      setDrafts(next);
      writeSentenceSnippetDrafts(contentId, next);
    },
    [contentId],
  );

  const allClips = useMemo<SentenceSnippetClip[]>(() => {
    if (!enabled) return [];
    const draftClips: SentenceSnippetClip[] = Object.entries(drafts).flatMap(
      ([sentenceId, list]) =>
        list.map((draft) => ({
          id: draft.id,
          kind: 'draft' as const,
          sentenceId,
          start: draft.start,
          end: draft.end,
          createdAt: draft.createdAt,
          hasPendingTimes: false,
          colorIndex: colorIndexForId(draft.id),
        })),
    );
    const savedClips: SentenceSnippetClip[] = contentSnippets
      .map((snippet, index) => ({ snippet, index }))
      .filter(
        ({ snippet }) =>
          isSentenceSnippet(snippet) &&
          typeof snippet.sentenceId === 'string' &&
          typeof snippet.start === 'number' &&
          typeof snippet.end === 'number',
      )
      .map(({ snippet, index }) => {
        const pending = pendingTimes[snippet.id];
        return {
          id: snippet.id,
          kind: 'saved' as const,
          sentenceId: snippet.sentenceId as string,
          start: pending?.start ?? (snippet.start as number),
          end: pending?.end ?? (snippet.end as number),
          // Saved records carry no createdAt; array order is creation order.
          createdAt: -1e15 + index,
          snippet,
          hasPendingTimes: Boolean(pending),
          colorIndex: colorIndexForId(snippet.id),
        };
      });
    const savedIds = new Set(savedClips.map((clip) => clip.id));
    return [
      ...draftClips.filter((clip) => !savedIds.has(clip.id)),
      ...savedClips,
    ];
  }, [enabled, drafts, contentSnippets, pendingTimes]);

  const clips = useMemo(
    () =>
      reviewSentenceId
        ? allClips
            .filter((clip) => clip.sentenceId === reviewSentenceId)
            .sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0))
        : [],
    [allClips, reviewSentenceId],
  );

  const focusedClip =
    rangeLoopState && !rangeLoopState.wordId
      ? allClips.find((clip) => clip.id === rangeLoopState.clipId) ?? null
    : null;

  const focusedClipText = useMemo(
    () =>
      focusedClip
        ? getClipText({
            range: focusedClip,
            secondsState,
            sentenceMap,
            mediaDuration,
            isTrimmed,
          })
        : null,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      focusedClip?.start,
      focusedClip?.end,
      secondsState,
      sentenceMap,
      mediaDuration,
      isTrimmed,
    ],
  );

  const focused = useMemo<FocusedSentenceSnippet | null>(() => {
    if (!focusedClip) return null;
    const sessionEdit = focusEdits[focusedClip.id] ?? null;
    const focus: ResolvedFocus = focusedClipText
      ? resolveClipFocus({
          clipText: focusedClipText,
          isTrimmed,
          sessionEdit,
          savedFocusedText: focusedClip.snippet?.focusedText,
          savedSuggestedFocusText: focusedClip.snippet?.suggestedFocusText,
        })
      : { range: null, isHumanSet: false };
    const hasFocusEdit = Boolean(sessionEdit);
    return {
      clip: focusedClip,
      clipText: focusedClipText,
      focus,
      hasFocusEdit,
      saveHint: getSaveHint(focusedClip, hasFocusEdit),
      deleteHint: getDeleteHint(focusedClip, deleteArmedId === focusedClip.id),
    };
  }, [focusedClip, focusedClipText, focusEdits, isTrimmed, deleteArmedId]);

  const seekAndPlay = useCallback(
    (time: number) => {
      const media = ref.current;
      if (!media) return;
      media.currentTime = time;
      void media.play?.();
    },
    [ref],
  );

  const startLoop = (clipId: string, range: ClipRange) => {
    playOnceTokenRef.current += 1;
    setThreeSecondLoopState(null);
    setLoopTranscriptState([]);
    setRangeLoopState({ start: range.start, end: range.end, clipId });
    sentenceSnippetGamepadBridge.setClipLoopActive(true);
    if (deleteArmedId && deleteArmedId !== clipId) setDeleteArmedId(null);
    seekAndPlay(range.start);
  };

  const stopLoop = useCallback(() => {
    setRangeLoopState(null);
    sentenceSnippetGamepadBridge.setClipLoopActive(false);
    setDeleteArmedId(null);
  }, [setRangeLoopState]);

  // The 3 s loop and the sentence loop clear the clip loop.
  useEffect(() => {
    if (threeSecondLoopState !== null || loopTranscriptState.length > 0) {
      if (rangeLoopState) stopLoop();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [threeSecondLoopState, loopTranscriptState]);

  // Focus goes back to the sentence when its clip disappears or the review
  // item changes.
  useEffect(() => {
    if (!rangeLoopState) return;
    // A word-started loop lasts while that word is the review item.
    if (rangeLoopState.wordId) {
      if (!isInReviewMode || rangeLoopState.wordId !== reviewWordId) {
        stopLoop();
      }
      return;
    }
    if (
      !focusedClip ||
      !isInReviewMode ||
      focusedClip.sentenceId !== reviewSentenceId
    ) {
      stopLoop();
    }
  }, [
    rangeLoopState,
    focusedClip,
    isInReviewMode,
    reviewSentenceId,
    reviewWordId,
    stopLoop,
  ]);

  // Only a focused clip owns B and L2+R2; a word-started loop leaves them to
  // the word card (B pauses / replays, L2+R2 removes the word).
  useEffect(() => {
    sentenceSnippetGamepadBridge.setClipLoopActive(
      Boolean(rangeLoopState && !rangeLoopState.wordId),
    );
  }, [rangeLoopState]);

  const holdStart = () => {
    if (!canCreate || !reviewSentenceId || holdRef.current) return;
    const media = ref.current;
    if (!media) return;
    if (rangeLoopState) stopLoop();
    // Nothing may pull playback back while the hold runs.
    setThreeSecondLoopState(null);
    setLoopTranscriptState([]);
    const next = { pressTime: media.currentTime, sentenceId: reviewSentenceId };
    holdRef.current = next;
    setHold(next);
  };

  const holdEnd = () => {
    const current = holdRef.current;
    holdRef.current = null;
    setHold(null);
    const media = ref.current;
    if (!current || !media) return;
    const sentence = sentenceMap[current.sentenceId];
    if (!sentence) return;
    const range = finalizeHoldRange({
      pressTime: current.pressTime,
      releaseTime: media.currentTime,
      sentence,
      mediaDuration,
    });
    if (!range) {
      notify(SENTENCE_SNIPPET_TOO_SHORT_MESSAGE);
      return;
    }
    const draft = { id: uuidv4(), ...range, createdAt: Date.now() };
    updateDrafts((prev) => ({
      ...prev,
      [current.sentenceId]: [...(prev[current.sentenceId] ?? []), draft],
    }));
    startLoop(draft.id, range);
  };

  const loopClip = (clipId: string) => {
    const clip = allClips.find((item) => item.id === clipId);
    if (clip) startLoop(clip.id, clip);
  };

  const selectLast = () => {
    if (!canCreate) return;
    const newest = clips[0];
    if (newest) startLoop(newest.id, newest);
  };

  const step = (direction: -1 | 1) => {
    if (!focusedClip) return;
    const byStart = [...clips].sort(
      (a, b) => a.start - b.start || a.end - b.end || a.id.localeCompare(b.id),
    );
    const index = byStart.findIndex((clip) => clip.id === focusedClip.id);
    const next = byStart[index + direction];
    if (index >= 0 && next) startLoop(next.id, next);
  };

  const nudge = (edge: 'start' | 'end', direction: -1 | 1) => {
    if (!focusedClip) return;
    const next = nudgeClipEdge(
      focusedClip,
      edge,
      direction * SENTENCE_SNIPPET_NUDGE_SECONDS,
      mediaDuration,
    );
    if (next.start === focusedClip.start && next.end === focusedClip.end) {
      return;
    }
    if (focusedClip.kind === 'draft') {
      updateDrafts((prev) => ({
        ...prev,
        [focusedClip.sentenceId]: (prev[focusedClip.sentenceId] ?? []).map(
          (draft) =>
            draft.id === focusedClip.id
              ? { ...draft, start: next.start, end: next.end }
              : draft,
        ),
      }));
    } else {
      const savedStart = focusedClip.snippet?.start;
      const savedEnd = focusedClip.snippet?.end;
      setPendingTimes((prev) => {
        const copy = { ...prev };
        if (next.start === savedStart && next.end === savedEnd) {
          delete copy[focusedClip.id];
        } else {
          copy[focusedClip.id] = next;
        }
        return copy;
      });
    }
    setRangeLoopState({ ...next, clipId: focusedClip.id });
    seekAndPlay(next.start);
  };

  const moveFocus = (move: SentenceSnippetFocusMove) => {
    const text = focused?.clipText?.targetLang;
    const range = focused?.focus.range;
    if (!focused || !text || !range) return;
    const next = stepClipFocus(text, range, move, isTrimmed);
    if (!next) return;
    setFocusEdits((prev) => ({
      ...prev,
      [focused.clip.id]: { ...next, text: text.slice(next.start, next.end) },
    }));
  };

  const clearClipSessionState = (clipId: string) => {
    setPendingTimes((prev) => {
      if (!(clipId in prev)) return prev;
      const copy = { ...prev };
      delete copy[clipId];
      return copy;
    });
    setFocusEdits((prev) => {
      if (!(clipId in prev)) return prev;
      const copy = { ...prev };
      delete copy[clipId];
      return copy;
    });
  };

  const removeDraft = (clip: SentenceSnippetClip) =>
    updateDrafts((prev) => ({
      ...prev,
      [clip.sentenceId]: (prev[clip.sentenceId] ?? []).filter(
        (draft) => draft.id !== clip.id,
      ),
    }));

  const save = async () => {
    if (!focused || isSavingRef.current) return;
    const { clip, clipText, focus, hasFocusEdit } = focused;
    if (!clipText) return;
    const sessionEdit = focusEdits[clip.id] ?? null;

    if (clip.kind === 'saved' && !clip.hasPendingTimes && !hasFocusEdit) {
      notify(SENTENCE_SNIPPET_ALREADY_SAVED_MESSAGE);
      return;
    }

    const focusedText =
      clip.kind === 'draft'
        ? hasFocusEdit && focus.range
          ? clipText.targetLang.slice(focus.range.start, focus.range.end)
          : undefined
        : focusedTextForResave({
            sessionEdit,
            existingFocusedText: clip.snippet?.focusedText,
            clipText,
            displayedFocus: focus,
          });

    const record = buildSentenceSnippetRecord({
      id: clip.id,
      sentenceId: clip.sentenceId,
      range: clip,
      clipText,
      focusedText,
    });
    if (!record) {
      notify(SENTENCE_SNIPPET_NO_BASE_LANG_MESSAGE);
      return;
    }

    isSavingRef.current = true;
    try {
      if (clip.kind === 'draft') {
        const ok = await saveSnippet(record, false);
        if (ok) {
          removeDraft(clip);
          clearClipSessionState(clip.id);
        }
        return;
      }

      // Keep any fields we don't manage (e.g. written by the extension).
      const merged: Snippet = { ...clip.snippet, ...record };
      delete merged.vocab;
      if (!record.focusedText) delete merged.focusedText;
      if (!record.suggestedFocusText) delete merged.suggestedFocusText;
      const ok = await saveSnippet(merged, true);
      if (ok) {
        clearClipSessionState(clip.id);
        notify(SENTENCE_SNIPPET_UPDATED_MESSAGE);
      }
    } finally {
      isSavingRef.current = false;
    }
  };

  const deleteFocused = async () => {
    if (!focusedClip) return;
    if (focusedClip.kind === 'draft') {
      removeDraft(focusedClip);
      clearClipSessionState(focusedClip.id);
      stopLoop();
      return;
    }
    if (deleteArmedId !== focusedClip.id) {
      setDeleteArmedId(focusedClip.id);
      return;
    }
    setDeleteArmedId(null);
    await deleteSnippet(focusedClip.id);
    clearClipSessionState(focusedClip.id);
    stopLoop();
  };

  const deleteFocusedRef = useRef(deleteFocused);
  deleteFocusedRef.current = deleteFocused;
  useEffect(() => {
    sentenceSnippetGamepadBridge.setDeleteHandler(() => {
      void deleteFocusedRef.current();
    });
    return () => sentenceSnippetGamepadBridge.setDeleteHandler(null);
  }, []);

  /** B in a clip loop: end the loop and keep playing from here. */
  const endLoop = () => {
    stopLoop();
    const media = ref.current;
    if (media?.paused) void media.play?.();
  };

  /**
   * B on a review word whose custom snippet holds it: loop that snippet's
   * start..end without focusing the clip for editing.
   */
  const loopWordSnippet = (
    wordId: string,
    clip: ClipRange & { snippetId: string },
  ) => {
    playOnceTokenRef.current += 1;
    setThreeSecondLoopState(null);
    setLoopTranscriptState([]);
    setRangeLoopState({
      start: clip.start,
      end: clip.end,
      clipId: clip.snippetId,
      wordId,
    });
    seekAndPlay(clip.start);
  };

  /** Play start..end once, then pause. */
  const playRangeOnce = (start: number, end: number) => {
    if (rangeLoopState) stopLoop();
    const token = (playOnceTokenRef.current += 1);
    seekAndPlay(start);
    const watch = () => {
      const media = ref.current;
      if (!media || playOnceTokenRef.current !== token) return;
      const time = media.currentTime;
      // Stop watching if the person sought elsewhere.
      if (time < start - 0.5 || time > end + 1) return;
      if (time >= end) {
        media.pause();
        return;
      }
      requestAnimationFrame(watch);
    };
    requestAnimationFrame(watch);
  };

  return {
    enabled,
    canCreate,
    reviewSentenceId: canCreate ? reviewSentenceId : null,
    clips: canCreate ? clips : [],
    focused,
    hold,
    holdStart,
    holdEnd,
    selectLast,
    step,
    nudge,
    moveFocus,
    save,
    deleteFocused,
    endLoop,
    loopClip,
    playRangeOnce,
    loopWordSnippet,
  };
};
