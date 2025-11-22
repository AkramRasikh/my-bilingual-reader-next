import { useEffect, useRef, useState } from 'react';
import useTranscriptItem from './useTranscriptItem';
import { Button } from '@/components/ui/button';
import clsx from 'clsx';
import { Loader2, SaveIcon } from 'lucide-react';

const TranscriptItemLoopingSentence = () => {
  const [isLoadingSaveSnippetState, setIsLoadingSaveSnippetState] =
    useState(false);
  const [highlightedTextFocusLoopState, setHighlightedTextFocusLoopState] =
    useState('');

  const masterTextRef = useRef(null);

  const { overlappingTextMemoized, handleSaveSnippet } = useTranscriptItem();

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

  const handleSaveSnippetFlow = async () => {
    console.log('## handleSaveSnippetFlow 1');

    try {
      console.log('## handleSaveSnippetFlow 2');
      setIsLoadingSaveSnippetState(true);
      console.log('## handleSaveSnippetFlow 3');
      await handleSaveSnippet({
        ...overlappingTextMemoized,
        focusedText: highlightedTextFocusLoopState,
      });
      console.log('## handleSaveSnippetFlow 4');
    } catch (error) {
      console.log('## handleSaveSnippetFlow error', error);
    } finally {
      setHighlightedTextFocusLoopState('');
      setIsLoadingSaveSnippetState(false);
    }
  };

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

  console.log(
    '## highlightedTextFocusLoopState',
    highlightedTextFocusLoopState,
  );

  return (
    <div className='flex justify-between w-full' ref={masterTextRef}>
      <div>
        <p className={'italic font-medium'}>
          {overlappingTextMemoized?.targetLang}
        </p>
        <p className={'italic font-medium'}>
          {overlappingTextMemoized?.baseLang}
        </p>
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
        disabled={!highlightedTextFocusLoopState || isLoadingSaveSnippetState}
      >
        {isLoadingSaveSnippetState ? <Loader2 /> : <SaveIcon />}
      </Button>
    </div>
  );
};

export default TranscriptItemLoopingSentence;
