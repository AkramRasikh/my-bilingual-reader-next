import { useEffect, useRef, useState } from 'react';
import useData from './useData';
import PopUpWordCard from './PopUpWordCard';

const TranscriptItem = ({
  contentItem,
  isVideoPlaying,
  handlePause,
  handleFromHere,
  masterPlay,
  index,
}) => {
  const ulRef = useRef<HTMLUListElement>(null);
  const [highlightedTextState, setHighlightedTextState] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [wordPopUpState, setWordPopUpState] = useState([]);
  const hoverTimer = useRef<NodeJS.Timeout | null>(null);

  const { targetLanguageLoadedWords, pureWords } = useData();

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

  const thisTime = contentItem.time;
  const thisSentenceIsPlaying = contentItem.id === masterPlay;

  const handleMouseEnter = (text) => {
    hoverTimer.current = setTimeout(() => {
      setShowModal(true); // Open modal
      const wordsAmongstHighlightedText = targetLanguageLoadedWords?.filter(
        (item) => {
          if (item.baseForm === text || item.surfaceForm === text) {
            return true;
          }
          return false;
        },
      );

      setWordPopUpState(wordsAmongstHighlightedText);
    }, 300);
  };

  const handleMouseLeave = () => {
    if (hoverTimer.current) {
      clearTimeout(hoverTimer.current); // Cancel if left early
      hoverTimer.current = null;
    }
  };

  const formattedSentence = (
    <span>
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
    >
      {wordPopUpState?.length > 0 ? (
        <ul>
          {wordPopUpState?.map((item) => (
            <li key={item.id}>
              <PopUpWordCard word={item} />
            </li>
          ))}
        </ul>
      ) : null}
      <div
        style={{
          display: 'flex',
          gap: 5,
        }}
      >
        <button
          style={{
            padding: 5,
            background: 'grey',
            borderRadius: 5,
            margin: 'auto 0',
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
            {thisSentenceIsPlaying && isVideoPlaying ? 'Pause' : 'Play'}
          </span>
        </button>
        <div
          style={{
            background: thisSentenceIsPlaying ? 'yellow' : 'none',
          }}
        >
          <p style={{ display: 'flex', gap: 3 }} ref={ulRef}>
            <span>{numberOrder}</span>
            {formattedSentence}
          </p>
          {baseLang}
        </div>
      </div>
      {highlightedTextState && (
        <div style={{ margin: 'auto' }}>
          <p
            style={{
              textAlign: 'right',
              display: 'flex',
              gap: 10,
              alignItems: 'center',
            }}
          >
            Add to Word bank!: {highlightedTextState}{' '}
            <button
              style={{ padding: 5, background: 'grey', borderRadius: 5 }}
              onClick={() => setHighlightedTextState('')}
            >
              CLEAR
            </button>
          </p>
        </div>
      )}
    </li>
  );
};

export default TranscriptItem;
