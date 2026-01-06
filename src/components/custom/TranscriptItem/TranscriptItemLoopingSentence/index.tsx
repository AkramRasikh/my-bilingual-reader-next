import { useEffect, useMemo, useRef, useState } from 'react';
import useTranscriptItem from '../useTranscriptItem';
import { Button } from '@/components/ui/button';
import clsx from 'clsx';
import { Loader2, SaveIcon } from 'lucide-react';
import { highlightSnippetTextApprox } from './highlight-snippet-text-approx';

const TranscriptItemLoopingSentence = ({
  overlappingTextMemoized,
  contentItemId,
}) => {
  const [isLoadingSaveSnippetState, setIsLoadingSaveSnippetState] =
    useState(false);
  const [highlightedTextFocusLoopState, setHighlightedTextFocusLoopState] =
    useState('');
  const [startIndexKeyState, setStartIndexKeyState] = useState(0);
  const [lengthAdjustmentState, setLengthAdjustmentState] = useState(0);

  const masterTextRef = useRef(null);
  const targetLang = overlappingTextMemoized.targetLang;
  const baseLang = overlappingTextMemoized.baseLang;
  const suggestedFocusText = overlappingTextMemoized.suggestedFocusText;

  const { handleSaveSnippet } = useTranscriptItem();

  useEffect(() => {
    function handleClickOutside(event) {
      // Only act if highlight mode is on
      if (
        highlightedTextFocusLoopState &&
        masterTextRef.current &&
        !masterTextRef.current.contains(event.target)
      ) {
        setHighlightedTextFocusLoopState(''); // or whatever action you need
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [masterTextRef, highlightedTextFocusLoopState]);

  useEffect(() => {
    const handleMouseUp = () => {
      const selection = window.getSelection();
      const selectedText = selection?.toString().trim();

      const anchorNode = selection?.anchorNode;
      if (!anchorNode || !masterTextRef.current?.contains(anchorNode)) return;

      setHighlightedTextFocusLoopState(selectedText || '');
    };

    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  const { htmlText, textMatch, matchStartKey, matchEndKey } = useMemo(() => {
    return highlightSnippetTextApprox(
      targetLang,
      suggestedFocusText,
      isLoadingSaveSnippetState,
      startIndexKeyState,
      lengthAdjustmentState,
    );
  }, [
    targetLang,
    suggestedFocusText,
    isLoadingSaveSnippetState,
    startIndexKeyState,
    lengthAdjustmentState,
  ]);

  const hasSnippetText =
    textMatch || highlightedTextFocusLoopState || suggestedFocusText;

  const handleSaveSnippetFlow = async () => {
    if (!hasSnippetText) {
      return;
    }
    try {
      setIsLoadingSaveSnippetState(true);
      await handleSaveSnippet({
        ...overlappingTextMemoized,
        focusedText:
          textMatch || highlightedTextFocusLoopState || suggestedFocusText,
      });
    } catch (error) {
    } finally {
      setHighlightedTextFocusLoopState('');
      setIsLoadingSaveSnippetState(false);
    }
  };

  useEffect(() => {
    const handleKeyDown = async (e: KeyboardEvent) => {
      const shiftKey = e.shiftKey;

      if (
        shiftKey &&
        e.key.toLowerCase() === '<' &&
        matchEndKey > matchStartKey + 1
      ) {
        setLengthAdjustmentState(lengthAdjustmentState - 1);
        return;
      }
      if (
        shiftKey &&
        e.key.toLowerCase() === '>' &&
        matchEndKey < targetLang.length
      ) {
        setLengthAdjustmentState(lengthAdjustmentState + 1);
        return;
      }
      const stopUserSpillingOverStartPoint = !(matchStartKey <= 0);
      if (e.key.toLowerCase() === ',' && stopUserSpillingOverStartPoint) {
        setStartIndexKeyState(startIndexKeyState - 1);
        return;
      }
      const stopUserSpillingOverEndPoint = !(matchEndKey >= targetLang.length);
      if (e.key.toLowerCase() === '.' && stopUserSpillingOverEndPoint) {
        setStartIndexKeyState(startIndexKeyState + 1);
        return;
      }

      if (hasSnippetText && shiftKey && e.key.toLowerCase() === 'enter') {
        await handleSaveSnippetFlow();
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [
    startIndexKeyState,
    lengthAdjustmentState,
    hasSnippetText,
    matchEndKey,
    matchStartKey,
    targetLang,
  ]);

  return (
    <div
      className='flex justify-between w-full'
      ref={masterTextRef}
      data-testid={`transcript-looping-sentence-${contentItemId}`}
    >
      <div>
        <p dangerouslySetInnerHTML={{ __html: htmlText }} />
        <p className={'italic font-medium'}>{baseLang}</p>
      </div>
      <Button
        size='icon'
        variant='outline'
        data-testid={`save-snippet-button-${contentItemId}`}
        className={clsx(
          'rounded-full h-9 w-9 my-0',
          isLoadingSaveSnippetState ? 'animate-spin bg-amber-600' : '',
          highlightedTextFocusLoopState
            ? 'animate-pulse bg-amber-600'
            : 'bg-gray-500',
        )}
        onClick={handleSaveSnippetFlow}
        disabled={
          isLoadingSaveSnippetState ||
          (!highlightedTextFocusLoopState && !htmlText)
        }
      >
        {isLoadingSaveSnippetState ? <Loader2 /> : <SaveIcon />}
      </Button>
    </div>
  );
};

export default TranscriptItemLoopingSentence;
