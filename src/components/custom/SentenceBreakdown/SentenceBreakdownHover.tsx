import React, { useEffect, useRef, useState } from 'react';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';
import { Button } from '@/components/ui/button';

const SentenceBreakdownHover = ({
  handleSaveFunc,
  surfaceForm,
  meaning,
  color,
  wordIsSaved,
  handleBreakdownSentence,
  sentenceId,
}) => {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const openedByTouchRef = useRef(false);
  const lastTouchToggleAtRef = useRef(Number.NEGATIVE_INFINITY);
  const triggerRef = useRef<HTMLSpanElement>(null);
  const placeholder = meaning === 'n/a';

  const handleDoubleClick = async () => {
    if (!handleBreakdownSentence) return;
    setLoading(true);
    try {
      await handleBreakdownSentence({ sentenceId, targetLang: surfaceForm });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (openedByTouchRef.current && !nextOpen) {
      return;
    }
    if (!nextOpen) {
      openedByTouchRef.current = false;
    }
    setOpen(nextOpen);
  };

  const toggleOpenedByTouch = () => {
    const now =
      typeof performance !== 'undefined' ? performance.now() : Date.now();
    if (now - lastTouchToggleAtRef.current < 50) return;
    lastTouchToggleAtRef.current = now;

    const nextOpen = !open;
    openedByTouchRef.current = nextOpen;
    setOpen(nextOpen);
  };

  const handleTriggerPointerDown = (event: React.PointerEvent) => {
    if (event.pointerType !== 'touch') return;
    event.preventDefault();
    toggleOpenedByTouch();
  };

  const handleTriggerTouchStart = (event: React.TouchEvent) => {
    event.preventDefault();
    toggleOpenedByTouch();
  };

  const handleSave = (isGoogle: boolean) => {
    openedByTouchRef.current = false;
    setOpen(false);
    handleSaveFunc(isGoogle, surfaceForm, meaning);
  };

  useEffect(() => {
    if (!open || !openedByTouchRef.current) return;

    const handleOutsidePointerDown = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (triggerRef.current?.contains(target)) return;
      if (
        target instanceof Element &&
        target.closest('[data-testid="sentence-breakdown-hover-content"]')
      ) {
        return;
      }
      openedByTouchRef.current = false;
      setOpen(false);
    };

    document.addEventListener('pointerdown', handleOutsidePointerDown, true);
    return () => {
      document.removeEventListener(
        'pointerdown',
        handleOutsidePointerDown,
        true,
      );
    };
  }, [open]);

  if (placeholder) {
    return (
      <span
        className={`text-black relative select-text shadow-md ${handleBreakdownSentence ? 'cursor-pointer' : ''} ${loading ? 'opacity-50' : ''}`}
        onDoubleClick={handleDoubleClick}
      >
        {surfaceForm}
        {loading && (
          <span
            className='absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none'
            aria-label='Loading'
          >
            <svg
              width='16'
              height='16'
              viewBox='0 0 16 16'
              fill='none'
              xmlns='http://www.w3.org/2000/svg'
              className='animate-spin'
            >
              <circle
                cx='8'
                cy='8'
                r='7'
                stroke='#888'
                strokeWidth='2'
                strokeDasharray='10 10'
                strokeLinecap='round'
              />
            </svg>
          </span>
        )}
      </span>
    );
  }
  return (
    <HoverCard open={open} onOpenChange={handleOpenChange}>
      <HoverCardTrigger
        asChild
        style={{
          textDecorationLine: wordIsSaved ? 'underline' : '',
        }}
      >
        <span
          ref={triggerRef}
          className='cursor-pointer'
          data-testid='sentence-breakdown-hover-trigger'
          style={{
            color,
          }}
          onPointerDownCapture={handleTriggerPointerDown}
          onTouchStart={handleTriggerTouchStart}
        >
          {surfaceForm}
        </span>
      </HoverCardTrigger>
      <HoverCardContent
        className='w-fit p-2 flex gap-3'
        data-testid='sentence-breakdown-hover-content'
      >
        <Button
          data-testid='breakdown-save-word-deepseek-button'
          variant='secondary'
          size='icon'
          onClick={() => handleSave(false)}
        >
          <img src='/deepseek.png' alt='Deepseek logo' />
        </Button>

        <Button
          data-testid='breakdown-save-word-google-button'
          variant='secondary'
          size='icon'
          onClick={() => handleSave(true)}
        >
          <img src='/google.png' alt='Google logo' />
        </Button>
      </HoverCardContent>
    </HoverCard>
  );
};

export default SentenceBreakdownHover;
