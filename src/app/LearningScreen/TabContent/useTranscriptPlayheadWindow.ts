import { useRef, useState } from 'react';
import { windowTranscriptAroundPlayhead } from '../utils/window-transcript-around-playhead';

type TranscriptWindowCursor = {
  startIndex: number;
  heldCenterId: string | null;
  activeIdWhenHeld: string | null;
};

export function useTranscriptPlayheadWindow<T extends { id: string }>(
  items: readonly T[],
  activeId: string | null | undefined,
  scrollTargetId: string | null | undefined,
) {
  const [cursor, setCursor] = useState<TranscriptWindowCursor>({
    startIndex: 0,
    heldCenterId: null,
    activeIdWhenHeld: null,
  });

  const windowed = windowTranscriptAroundPlayhead({
    items,
    activeId,
    scrollTargetId,
    previousStart: cursor.startIndex,
    heldCenterId: cursor.heldCenterId,
    activeIdWhenHeld: cursor.activeIdWhenHeld,
  });

  if (
    windowed.startIndex !== cursor.startIndex ||
    windowed.heldCenterId !== cursor.heldCenterId ||
    windowed.activeIdWhenHeld !== cursor.activeIdWhenHeld
  ) {
    setCursor({
      startIndex: windowed.startIndex,
      heldCenterId: windowed.heldCenterId,
      activeIdWhenHeld: windowed.activeIdWhenHeld,
    });
  }

  const stableItemsRef = useRef(windowed.items);
  const previousItems = stableItemsRef.current;
  const sameItems =
    previousItems.length === windowed.items.length &&
    previousItems.every((item, index) => item === windowed.items[index]);
  if (!sameItems) {
    stableItemsRef.current = windowed.items;
  }

  return {
    ...windowed,
    items: stableItemsRef.current,
  };
}
