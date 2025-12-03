import { useEffect, useMemo, useRef, useState } from 'react';
import useTranscriptItem from './useTranscriptItem';
import { Button } from '@/components/ui/button';
import clsx from 'clsx';
import { Loader2, SaveIcon } from 'lucide-react';

export function highlightApprox(
  fullText,
  slicedText,
  isLoadingSaveSnippetState,
  startIndexKeyState,
  endIndexKeyState,
) {
  function findApproxIndex(text, query) {
    // If exact match exists, return it
    const exact = text.indexOf(query);
    if (exact !== -1) return exact;

    // Otherwise fuzzy: sliding window + similarity scoring
    let bestIndex = 0;
    let bestScore = 0;

    const qLen = query.length;

    for (let i = 0; i <= text.length - qLen; i++) {
      const chunk = text.slice(i, i + qLen);

      // similarity = proportion of matching characters
      let score = 0;
      for (let j = 0; j < qLen; j++) {
        if (chunk[j] === query[j]) score++;
      }
      score = score / qLen;

      if (score > bestScore) {
        bestScore = score;
        bestIndex = i;
      }
    }

    return bestScore > 0.4 ? bestIndex : -1;
    // threshold can be tuned
  }

  const index = findApproxIndex(fullText, slicedText);
  if (index === -1) return fullText; // no suitable match

  const before = fullText.slice(0, index + startIndexKeyState);
  const match = fullText.slice(
    index + startIndexKeyState,
    index + endIndexKeyState + slicedText.length,
  );
  const after = fullText.slice(index + endIndexKeyState + slicedText.length);

  const opacityClass = isLoadingSaveSnippetState ? 'opacity-50' : '';
  return {
    htmlText: `
        ${before}
        <span class="bg-yellow-200 shadow-yellow-500 shadow-sm px-1 rounded ${opacityClass}">
            ${match}
        </span>
        ${after}
    `,
    textMatch: match,
    matchStartKey: index + startIndexKeyState,
    matchEndKey: index + endIndexKeyState + slicedText.length,
  };
}

const TranscriptItemLoopingSentence = ({ overlappingTextMemoized }) => {
  const [isLoadingSaveSnippetState, setIsLoadingSaveSnippetState] =
    useState(false);
  const [highlightedTextFocusLoopState, setHighlightedTextFocusLoopState] =
    useState('');
  const [startIndexKeyState, setStartIndexKeyState] = useState(0);
  const [endIndexKeyState, setEndIndexKeyState] = useState(0);

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

  const { htmlText, textMatch } = useMemo(() => {
    return highlightApprox(
      targetLang,
      suggestedFocusText,
      isLoadingSaveSnippetState,
      startIndexKeyState,
      endIndexKeyState,
    );
  }, [
    targetLang,
    suggestedFocusText,
    isLoadingSaveSnippetState,
    startIndexKeyState,
    endIndexKeyState,
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

      if (e.key.toLowerCase() === ',') {
        setStartIndexKeyState(startIndexKeyState - 1);
        setEndIndexKeyState(endIndexKeyState - 1);
        return;
      }
      if (e.key.toLowerCase() === '.') {
        setStartIndexKeyState(startIndexKeyState + 1);
        setEndIndexKeyState(endIndexKeyState + 1);
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
  }, [startIndexKeyState, endIndexKeyState, hasSnippetText]);

  return (
    <div className='flex justify-between w-full' ref={masterTextRef}>
      <div>
        <p dangerouslySetInnerHTML={{ __html: htmlText }} />
        <p className={'italic font-medium'}>{baseLang}</p>
      </div>
      <Button
        size='icon'
        variant='outline'
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
