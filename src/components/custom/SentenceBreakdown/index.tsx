import { useState } from 'react';
import SentenceBreakdownSyntacticStructure from './SentenceBreakdownSyntacticStructure';
import SentenceBreakdownTargetLang from './SentenceBreakdownTargetLang';

const SentenceBreakdown = ({
  vocab,
  thisSentencesSavedWords,
  handleSaveFunc,
  meaning,
  languageSelectedState,
}) => {
  const [hoveredXStates, setHoveredXStates] = useState('');

  const handleAddIndexToArr = (index) => {
    setHoveredXStates(index);
  };

  const handleOnMouseExit = (index) => {
    if (hoveredXStates === index) {
      setTimeout(() => setHoveredXStates(''), 2000);
    }
  };

  return (
    <div data-testid='sentence-breakdown-container'>
      <SentenceBreakdownTargetLang
        vocab={vocab}
        thisSentencesSavedWords={thisSentencesSavedWords}
        handleSaveFunc={handleSaveFunc}
        handleAddIndexToArr={handleAddIndexToArr}
        handleOnMouseExit={handleOnMouseExit}
        languageSelectedState={languageSelectedState}
      />
      <hr className='m-1' />
      <SentenceBreakdownSyntacticStructure
        vocab={vocab}
        hoveredXStates={hoveredXStates}
      />
      <hr className='m-1' />
      <p data-testid='sentence-breakdown-meaning'>{meaning}</p>
    </div>
  );
};

export default SentenceBreakdown;
