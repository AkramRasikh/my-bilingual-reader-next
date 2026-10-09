export type SnippetReviewVisual = {
  snippetId: string;
  startIndexKey: number;
  lengthAdjustment: number;
  matchStartWord: number | null;
  matchWordsHighlighted: number;
  wordIsLoading: number | null;
  isLoadingSave: boolean;
};

let snapshot: SnippetReviewVisual | null = null;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

function isSameVisual(next: SnippetReviewVisual) {
  return (
    snapshot?.snippetId === next.snippetId &&
    snapshot.startIndexKey === next.startIndexKey &&
    snapshot.lengthAdjustment === next.lengthAdjustment &&
    snapshot.matchStartWord === next.matchStartWord &&
    snapshot.matchWordsHighlighted === next.matchWordsHighlighted &&
    snapshot.wordIsLoading === next.wordIsLoading &&
    snapshot.isLoadingSave === next.isLoadingSave
  );
}

export function publishSnippetReviewVisual(next: SnippetReviewVisual) {
  if (isSameVisual(next)) return;
  snapshot = next;
  emit();
}

export function clearSnippetReviewVisual(snippetId: string) {
  if (snapshot?.snippetId !== snippetId) return;
  snapshot = null;
  emit();
}

export function subscribeSnippetReviewVisual(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getSnippetReviewVisualSnapshot() {
  return snapshot;
}

export function subscribeSnippetReviewVisualNoop() {
  return () => {};
}

export function getEmptySnippetReviewVisualSnapshot() {
  return null;
}
