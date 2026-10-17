export function playbackCaptionBreakdownToggle(
  currentId: string | null,
  sentenceId: string,
  alreadyBrokenDown: boolean,
) {
  if (!alreadyBrokenDown) {
    return { nextId: currentId, requestBreakdown: true };
  }
  return {
    nextId: currentId === sentenceId ? null : sentenceId,
    requestBreakdown: false,
  };
}
