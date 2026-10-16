let waitingId: string | null = null;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

export function publishReviewOverlayWait(id: string) {
  if (waitingId === id) return;
  waitingId = id;
  emit();
}

export function clearReviewOverlayWait(id: string) {
  if (waitingId !== id) return;
  waitingId = null;
  emit();
}

export function resetReviewOverlayWait() {
  if (waitingId == null) return;
  waitingId = null;
  emit();
}

export function subscribeReviewOverlayWait(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getReviewOverlayWaitSnapshot() {
  return waitingId;
}
