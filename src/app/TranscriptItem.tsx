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
  index,
  handleBreakdownSentence,
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

      if (!selectedText) return;

      const anchorNode = selection?.anchorNode;
      if (!anchorNode || !ulRef.current?.contains(anchorNode)) return;

      setHighlightedTextState(selectedText);
    };

    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  const numberOrder = index + 1 + ') ';
  const baseLang = contentItem.baseLang;
  const targetLangformatted = contentItem.targetLangformatted;
  const hasBeenReviewed = contentItem?.reviewData?.due;

  const thisTime = contentItem.time;
  const thisSentenceIsPlaying = contentItem.id === masterPlay;

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

  const handleSaveFunc = async (isGoogle) => {
    try {
      setIsLoadingState(true);
      await handleSaveWord({
        highlightedWord: highlightedTextState,
        highlightedWordSentenceId: contentItem.id,
        contextSentence: contentItem.targetLang,
        meaning: contentItem?.meaning,
        isGoogle,
        // meaning: thisWordMeaning,
      });
    } catch (error) {
    } finally {
      setHighlightedTextState('');
      setWordPopUpState([]);
      setIsLoadingState(false);
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
    <span ref={ulRef}>
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
      style={{
        gap: 5,
      }}
      onMouseLeave={() => setWordPopUpState([])}
    >
      <div
        style={{
          display: 'flex',
          gap: 5,
        }}
      >
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
        <div>
          <button
            className={clsx(
              'rounded-lg p-1',
              hasBeenReviewed && 'border-2 border-amber-700',
            )}
            onClick={() => setShowMenuState(!showMenuState)}
          >
            🍔
          </button>
        </div>
        <div
          style={{
            background: thisSentenceIsPlaying ? 'yellow' : 'none',
            display: 'flex',
          }}
        >
          <div>
            <p style={{ display: 'flex', gap: 10 }}>
              <span>{numberOrder}</span>
              {formattedSentence}
            </p>
            <p>{baseLang}</p>
          </div>
        </div>
      </div>
      {showMenuState && (
        <MenuSection
          contentItem={contentItem}
          setShowSentenceBreakdownState={setShowSentenceBreakdownState}
          showSentenceBreakdownState={showSentenceBreakdownState}
          handleReviewFunc={handleReviewFunc}
          handleBreakdownSentence={handleBreakdownSentence}
        />
      )}
      {showSentenceBreakdownState && contentItem?.sentenceStructure ? (
        <SentenceBreakdown
          vocab={contentItem.vocab}
          meaning={contentItem.meaning}
          sentenceStructure={contentItem.sentenceStructure}
          showSentenceBreakdownState={showSentenceBreakdownState}
          setShowSentenceBreakdownState={setShowSentenceBreakdownState}
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
    </li>
  );
};

export default TranscriptItem;
