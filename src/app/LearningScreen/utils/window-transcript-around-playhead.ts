export const TRANSCRIPT_WINDOW_RADIUS = 10;
export const TRANSCRIPT_WINDOW_EDGE = 4;

const WINDOW_SIZE = TRANSCRIPT_WINDOW_RADIUS * 2 + 1;

export type WindowTranscriptAroundPlayheadArgs<T extends { id: string }> = {
  items: readonly T[];
  activeId: string | null | undefined;
  scrollTargetId?: string | null;
  previousStart: number;
  heldCenterId?: string | null;
  activeIdWhenHeld?: string | null;
};

export type WindowTranscriptAroundPlayheadResult<T extends { id: string }> = {
  items: T[];
  startIndex: number;
  heldCenterId: string | null;
  activeIdWhenHeld: string | null;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function recenterStart(center: number, length: number) {
  const maxStart = Math.max(0, length - WINDOW_SIZE);
  return clamp(center - TRANSCRIPT_WINDOW_RADIUS, 0, maxStart);
}

function sliceWindow<T>(items: readonly T[], startIndex: number) {
  return items.slice(startIndex, startIndex + WINDOW_SIZE);
}

export function windowTranscriptAroundPlayhead<T extends { id: string }>({
  items,
  activeId,
  scrollTargetId,
  previousStart,
  heldCenterId = null,
  activeIdWhenHeld = null,
}: WindowTranscriptAroundPlayheadArgs<T>): WindowTranscriptAroundPlayheadResult<T> {
  if (items.length === 0) {
    return {
      items: [],
      startIndex: 0,
      heldCenterId: null,
      activeIdWhenHeld: null,
    };
  }

  if (items.length <= WINDOW_SIZE) {
    return {
      items: items.slice(),
      startIndex: 0,
      heldCenterId: null,
      activeIdWhenHeld: null,
    };
  }

  const maxStart = items.length - WINDOW_SIZE;
  const safePrevious = clamp(
    Number.isFinite(previousStart) ? previousStart : 0,
    0,
    maxStart,
  );

  const normalizedScrollTarget =
    scrollTargetId && scrollTargetId.length > 0 ? scrollTargetId : null;
  const scrollIndex = normalizedScrollTarget
    ? items.findIndex((item) => item.id === normalizedScrollTarget)
    : -1;

  if (scrollIndex >= 0) {
    const previousEnd = safePrevious + WINDOW_SIZE - 1;
    const outside = scrollIndex < safePrevious || scrollIndex > previousEnd;
    if (outside) {
      const startIndex = recenterStart(scrollIndex, items.length);
      return {
        items: sliceWindow(items, startIndex),
        startIndex,
        heldCenterId: normalizedScrollTarget,
        activeIdWhenHeld: activeId ?? null,
      };
    }
  }

  const holding =
    heldCenterId != null &&
    activeIdWhenHeld != null &&
    activeId === activeIdWhenHeld &&
    items.some((item) => item.id === heldCenterId);

  if (holding) {
    return {
      items: sliceWindow(items, safePrevious),
      startIndex: safePrevious,
      heldCenterId,
      activeIdWhenHeld,
    };
  }

  const center = activeId
    ? items.findIndex((item) => item.id === activeId)
    : -1;

  if (center < 0) {
    return {
      items: sliceWindow(items, 0),
      startIndex: 0,
      heldCenterId: null,
      activeIdWhenHeld: null,
    };
  }

  const previousEnd = safePrevious + WINDOW_SIZE - 1;
  const inside = center >= safePrevious && center <= previousEnd;
  const nearEdge =
    center - safePrevious < TRANSCRIPT_WINDOW_EDGE ||
    previousEnd - center < TRANSCRIPT_WINDOW_EDGE;
  const startIndex =
    !inside || nearEdge ? recenterStart(center, items.length) : safePrevious;

  return {
    items: sliceWindow(items, startIndex),
    startIndex,
    heldCenterId: null,
    activeIdWhenHeld: null,
  };
}
