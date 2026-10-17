export function SentenceBreakdownOverlayBrick() {
  return (
    <span
      data-testid='sentence-breakdown-overlay-brick'
      role='status'
      aria-label='Sentence breakdown in progress'
      className='pointer-events-none absolute inset-0 z-10 flex items-center justify-center'
    >
      <span className='animate-bounce text-lg leading-none opacity-60' aria-hidden>
        🧱
      </span>
    </span>
  );
}
