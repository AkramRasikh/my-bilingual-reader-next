export function playbackCaptionBreakdownToggle(
  currentId: string | null,
  sentenceId: string,
  alreadyBrokenDown: boolean,
  isInReviewMode: boolean,
) {
  if (!alreadyBrokenDown) {
    return { nextId: currentId, requestBreakdown: true };
  }
  if (isInReviewMode) {
    return { nextId: currentId, requestBreakdown: false };
  }
  return {
    nextId: currentId === sentenceId ? null : sentenceId,
    requestBreakdown: false,
  };
}
