import { useEffect, useRef, useState } from 'react';
import useData from './useData';
import PopUpWordCard from './PopUpWordCard';
import HighlightedTextSection from './HighlightedTextSection';
import SentenceBreakdown from './SentenceBreakdown';
import clsx from 'clsx';
import MenuSection from './MenuSection';

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
}) => {
  const ulRef = useRef<HTMLUListElement>(null);
  const [highlightedTextState, setHighlightedTextState] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showMenuState, setShowMenuState] = useState(false);
  const [showSentenceBreakdownState, setShowSentenceBreakdownState] =
    useState(false);
  const [isLoadingState, setIsLoadingState] = useState(false);
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
    if (!showMenuState) {
      setShowSentenceBreakdownState(false);
    }
  }, [showMenuState]);

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

  const handleMouseEnter = (text) => {
    hoverTimer.current = setTimeout(() => {
      setShowModal(true); // Open modal
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

  const formattedSentence = (
    <span ref={ulRef} className='mt-auto mb-auto'>
      {targetLangformatted.map((item, indexNested) => {
        const isUnderlined = item?.style?.textDecorationLine;
        const text = item?.text;
        return (
          <span
            key={indexNested}
            onMouseEnter={
              isUnderlined ? () => handleMouseEnter(text) : () => {}
            }
            onMouseLeave={handleMouseLeave}
            style={{
              textDecorationLine: isUnderlined ? 'underline' : 'none',
            }}
          >
            {text}
          </span>
        );
      })}
    </span>
  );

  return (
    <li
      className={clsx(
        showMenuState &&
          'rounded-lg px-2 py-1 shadow h-fit border-2 border-blue-200',
      )}
      style={{
        gap: 5,
        opacity: 0,
        animation: 'fadeIn 0.5s ease-out forwards',
      }}
      onMouseLeave={() => setWordPopUpState([])}
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
              background:
                thisSentenceIsPlaying && isVideoPlaying ? 'green' : 'grey',
              borderRadius: 5,
              margin: 'auto 0',
              marginTop: 0,
            }}
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
          <button
            id='menu'
            className={clsx(
              'rounded-sm bg-blue-400 text-white px-2 py-1 shadow h-fit',
              hasBeenReviewed && 'border-2 border-amber-700',
            )}
            onClick={() => setShowMenuState(!showMenuState)}
          >
            <span>≣</span>
          </button>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            background: thisSentenceIsPlaying ? 'yellow' : 'none',
          }}
        >
          <div>
            <p style={{ display: 'flex', gap: 10 }}>{formattedSentence}</p>
            <p>{baseLang}</p>
          </div>
          {showMenuState && (
            <div className='flex flex-col gap-0.5'>
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
            </div>
          )}
        </div>
      </div>
      {showMenuState && (
        <MenuSection
          contentItem={contentItem}
          setShowSentenceBreakdownState={setShowSentenceBreakdownState}
          showSentenceBreakdownState={showSentenceBreakdownState}
          handleBreakdownSentence={handleBreakdownSentence}
        />
      )}
      {showSentenceBreakdownState && contentItem?.sentenceStructure ? (
        <SentenceBreakdown
          vocab={contentItem.vocab}
          meaning={contentItem.meaning}
          thisSentencesSavedWords={thisSentencesSavedWords}
          handleSaveFunc={handleSaveFunc}
        />
      ) : null}
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
