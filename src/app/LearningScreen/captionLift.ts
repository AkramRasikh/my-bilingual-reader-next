export const CAPTION_LIFT_STEP = 10;
export const CAPTION_LIFT_MAX = 100;

export function stepCaptionLift(percent: number, direction: 1 | -1) {
  const next = percent + direction * CAPTION_LIFT_STEP;
  if (next < 0) return 0;
  if (next > CAPTION_LIFT_MAX) return CAPTION_LIFT_MAX;
  return next;
}

function liftFraction(percent: number) {
  const clamped = Math.min(CAPTION_LIFT_MAX, Math.max(0, percent));
  return clamped / CAPTION_LIFT_MAX;
}

function cssNumber(value: number) {
  return String(Math.round(value * 1000) / 1000);
}

/** Bottom edge of playback captions: 0 stays at `bottom-2`, 1 sits on the video midpoint. */
export function playbackCaptionBottom(percent: number) {
  const fraction = liftFraction(percent);
  if (fraction <= 0) return undefined;
  return `calc(0.5rem * ${cssNumber(1 - fraction)} + 50% * ${cssNumber(fraction)})`;
}

/** Bottom padding that raises a bottom-anchored review transcript to the same midpoint. */
export function reviewCaptionPaddingBottom(percent: number) {
  const fraction = liftFraction(percent);
  if (fraction <= 0) return undefined;
  return `${cssNumber(fraction * 50)}%`;
}
