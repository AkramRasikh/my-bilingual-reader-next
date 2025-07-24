import { useEffect, useRef, useState } from 'react';
import useData from './useData';
import PopUpWordCard from './PopUpWordCard';
import HighlightedTextSection from './HighlightedTextSection';
import { NewSentenceBreakdown } from './SentenceBreakdown';
import clsx from 'clsx';
import MenuSection from './MenuSection';
import LoadingSpinner from './LoadingSpinner';
import { MenuIcon, Repeat2 } from 'lucide-react';
import FormattedSentence from './FormattedSentence';

const TranscriptItem = ({
  contentItem,
  isVideoPlaying,
  handlePause,
  handleFromHere,
  masterPlay,
  handleReviewFunc,
  handleBreakdownSentence,
  sentenceHighlightingState,
  setSentenceHighlightingState,
  isGenericItemLoadingState,
  handleOpenBreakdownSentence,
  breakdownSentencesArrState,
  setBreakdownSentencesArrState,
  isPressDownShiftState,
  loopTranscriptState,
  setLoopTranscriptState,
}) => {
  const ulRef = useRef<HTMLUListElement>(null);
  const [highlightedTextState, setHighlightedTextState] = useState('');
  const [showSentenceBreakdownState, setShowSentenceBreakdownState] =
    useState(false);
  const [showMenuState, setShowMenuState] = useState(false);

  const [isLoadingState, setIsLoadingState] = useState(false);
  const [
    showThisSentenceBreakdownPreviewState,
    setShowThisSentenceBreakdownPreviewState,
  ] = useState(false);
  const [wordPopUpState, setWordPopUpState] = useState([]);
  const hoverTimer = useRef<NodeJS.Timeout | null>(null);

  const { wordsState, handleSaveWord, handleDeleteWordDataProvider } =
    useData();

  useEffect(() => {
    const handleMouseUp = () => {
      const selection = window.getSelection();
      const selectedText = selection?.toString().trim();

      const anchorNode = selection?.anchorNode;
      if (!anchorNode || !ulRef.current?.contains(anchorNode)) return;

      setSentenceHighlightingState(contentItem.id);
      setHighlightedTextState(selectedText || '');
    };

    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  useEffect(() => {
    if (sentenceHighlightingState !== contentItem.id && highlightedTextState) {
      setHighlightedTextState('');
    }
  }, [sentenceHighlightingState, highlightedTextState]);

  const baseLang = contentItem.baseLang;
  const targetLangformatted = contentItem.targetLangformatted;
  const hasBeenReviewed = contentItem?.reviewData?.due;

  const thisTime = contentItem.time;
  const thisSentenceIsPlaying = contentItem.id === masterPlay;

  const thisSentencesSavedWords = contentItem.targetLangformatted.filter(
    (item) => item?.id === 'targetWord',
  );

  const hasSentenceBreakdown = contentItem?.sentenceStructure;

  const isGenericallyDoingAsyncAction = isGenericItemLoadingState.includes(
    contentItem.id,
  );

  const isInSentenceBreakdown = breakdownSentencesArrState.includes(
    contentItem.id,
  );

  useEffect(() => {
    setShowSentenceBreakdownState(isInSentenceBreakdown);
  }, [isInSentenceBreakdown]);

  useEffect(() => {
    if (!isPressDownShiftState && showThisSentenceBreakdownPreviewState) {
      setShowThisSentenceBreakdownPreviewState(false);
    }
  }, [isPressDownShiftState, showThisSentenceBreakdownPreviewState]);

  const handleMouseEnter = (text) => {
    hoverTimer.current = setTimeout(() => {
      const wordsAmongstHighlightedText = wordsState?.filter((item) => {
        if (item.baseForm === text || item.surfaceForm === text) {
          return true;
        }
        return false;
      });

      setWordPopUpState(wordsAmongstHighlightedText);
    }, 300);
  };

  const handleMouseLeave = () => {
    if (hoverTimer.current) {
      clearTimeout(hoverTimer.current); // Cancel if left early
      hoverTimer.current = null;
    }
  };

  const handleSaveFunc = async (isGoogle, thisWord, thisWordMeaning) => {
    try {
      setIsLoadingState(true);
      await handleSaveWord({
        highlightedWord: highlightedTextState || thisWord,
        highlightedWordSentenceId: contentItem.id,
        contextSentence: contentItem.targetLang,
        meaning: thisWordMeaning,
        isGoogle,
      });
    } catch (error) {
    } finally {
      setHighlightedTextState('');
      setWordPopUpState([]);
      setIsLoadingState(false);
    }
  };
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(contentItem.targetLang);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  const handleDeleteFunc = async (wordData) => {
    try {
      const resBool = await handleDeleteWordDataProvider(wordData);
      if (resBool) {
        setWordPopUpState([]);
      }
      return resBool;
    } catch (error) {
      console.log('## handleDeleteFunc error', error);
    }
  };

  const handleOnMouseEnterSentence = () => {
    if (!isPressDownShiftState || !hasSentenceBreakdown) return null;
    setShowThisSentenceBreakdownPreviewState(true);
  };

  const closeBreakdown = () => {
    setBreakdownSentencesArrState((prev) =>
      prev.filter((item) => item !== contentItem.id),
    );
  };

  return (
    <li
      className={clsx(
        'rounded-lg px-2 py-1 shadow h-fit border-2 ',
        hasBeenReviewed ? 'border-amber-500' : 'border-blue-200',
      )}
      style={{
        gap: 5,
        opacity: 0,
        animation: 'fadeIn 0.5s ease-out forwards',
      }}
      onMouseEnter={handleOnMouseEnterSentence}
      onMouseLeave={() => {
        setWordPopUpState([]);
        setShowThisSentenceBreakdownPreviewState(false);
      }}
    >
      <div
        style={{
          display: 'flex',
          gap: 5,
        }}
      >
        <div className='flex flex-col gap-1 h-fit'>
          <button
            style={{
              padding: 5,
              borderRadius: 5,
              margin: 'auto 0',
              marginTop: 0,
            }}
            className={clsx(
              'bg-gray-300',
              thisSentenceIsPlaying && isVideoPlaying && 'bg-yellow-200',
            )}
            onClick={
              thisSentenceIsPlaying && isVideoPlaying
                ? handlePause
                : () => handleFromHere(thisTime)
            }
          >
            <span
              style={{
                height: 16,
              }}
            >
              {thisSentenceIsPlaying && isVideoPlaying ? '⏸️' : '▶️'}
            </span>
          </button>

          {hasSentenceBreakdown && (
            <button
              id='show-breakdown'
              onClick={() => {
                if (showSentenceBreakdownState) {
                  closeBreakdown();
                } else {
                  setBreakdownSentencesArrState((prev) => [
                    ...prev,
                    contentItem.id,
                  ]);
                }
              }}
            >
              <span className='m-auto'>
                {showSentenceBreakdownState ? '❌' : '🧱'}
              </span>
            </button>
          )}
          {loopTranscriptState?.id === contentItem.id && (
            <button
              id='stop-loop'
              onClick={() => setLoopTranscriptState(null)}
              className='animate-spin'
            >
              <Repeat2 />
            </button>
          )}

          {(isGenericallyDoingAsyncAction || isLoadingState) && (
            <div className='m-auto'>
              <LoadingSpinner />
            </div>
          )}
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            width: '100%',
          }}
        >
          <div className={clsx(thisSentenceIsPlaying && 'bg-yellow-200 h-fit')}>
            {(showSentenceBreakdownState && hasSentenceBreakdown) ||
            showThisSentenceBreakdownPreviewState ? (
              <NewSentenceBreakdown
                vocab={contentItem.vocab}
                meaning={contentItem.meaning}
                thisSentencesSavedWords={thisSentencesSavedWords}
                handleSaveFunc={handleSaveFunc}
                sentenceStructure={contentItem.sentenceStructure}
              />
            ) : (
              <>
                <p className='flex gap-2'>
                  <FormattedSentence
                    ref={ulRef}
                    targetLangformatted={targetLangformatted}
                    handleMouseLeave={handleMouseLeave}
                    handleMouseEnter={handleMouseEnter}
                  />
                </p>
                <p>{baseLang}</p>
              </>
            )}
          </div>

          <div className='flex flex-col gap-0.5'>
            {showMenuState ? (
              <>
                <button
                  className='bg-gray-400 p-1 mt-0 rounded transparent'
                  id='show-menu'
                  onClick={() => setShowMenuState(!showMenuState)}
                >
                  <MenuIcon />
                </button>
                <button
                  id='copy'
                  className='border border-amber-200 rounded-sm p-0.5 transition active:scale-95 cursor-pointer'
                  onClick={handleCopy}
                >
                  📋
                </button>
                {hasBeenReviewed ? (
                  <button
                    id='review'
                    className='border border-amber-200 rounded-sm p-0.5 transition active:scale-95 cursor-pointer'
                    onClick={async () =>
                      await handleReviewFunc({
                        sentenceId: contentItem.id,
                        isRemoveReview: true,
                      })
                    }
                  >
                    🗑️
                  </button>
                ) : (
                  <button
                    id='review'
                    onClick={async () =>
                      await handleReviewFunc({
                        sentenceId: contentItem.id,
                        isRemoveReview: false,
                      })
                    }
                    className='border border-amber-200 rounded-sm p-0.5 transition active:scale-95 cursor-pointer'
                  >
                    ⏰
                  </button>
                )}
                <MenuSection
                  contentItem={contentItem}
                  setShowSentenceBreakdownState={setShowSentenceBreakdownState}
                  showSentenceBreakdownState={showSentenceBreakdownState}
                  handleBreakdownSentence={handleBreakdownSentence}
                  handleOpenBreakdownSentence={handleOpenBreakdownSentence}
                  setBreakdownSentencesArrState={setBreakdownSentencesArrState}
                />
              </>
            ) : (
              <button
                className='bg-gray-400 p-1 mt-0 rounded'
                id='show-menu'
                onClick={() => setShowMenuState(!showMenuState)}
              >
                <MenuIcon />
              </button>
            )}
          </div>
        </div>
      </div>

      {wordPopUpState?.length > 0 ? (
        <ul>
          {wordPopUpState?.map((item) => (
            <li key={item.id}>
              <PopUpWordCard
                word={item}
                onClose={() => setWordPopUpState([])}
                handleDelete={handleDeleteFunc}
              />
            </li>
          ))}
        </ul>
      ) : null}
      {highlightedTextState && (
        <HighlightedTextSection
          isLoadingState={isLoadingState}
          handleSaveFunc={handleSaveFunc}
          setHighlightedTextState={setHighlightedTextState}
          highlightedTextState={highlightedTextState}
        />
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
      `}</style>
    </li>
  );
};

export default TranscriptItem;
