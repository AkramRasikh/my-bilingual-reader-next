import { render, screen } from '@testing-library/react';
import FormattedSentenceSnippet from './SnippetReviewContent';
import { LanguageEnum } from '@/app/languages';

describe('FormattedSentenceSnippet saving spinners', () => {
  it('shows a spinner on every chunk that is saving, including one that is not selected', () => {
    const characters = [
      { text: '你', index: 0, startIndex: 0, surfaceForm: '你', meaning: 'you' },
      { text: '好', index: 1, startIndex: 1, surfaceForm: '好', meaning: 'good' },
      {
        text: '世',
        index: 2,
        startIndex: 2,
        surfaceForm: '世界',
        meaning: 'world',
      },
      {
        text: '界',
        index: 3,
        startIndex: 2,
        surfaceForm: '世界',
        meaning: 'world',
      },
    ];

    render(
      <FormattedSentenceSnippet
        targetLangformatted={characters}
        wordPopUpState={[]}
        setWordPopUpState={() => {}}
        handleDeleteWordDataProvider={() => {}}
        wordsFromSentence={[]}
        languageSelectedState={LanguageEnum.French}
        matchStartKey={0}
        matchEndKey={3}
        handleSaveFunc={async () => {}}
        currentTime={0}
        snippetStartTime={0}
        snippetEndTime={1}
        isReadyForQuickReview={false}
        matchStartWordState={0}
        matchWordsHighlghtedState={0}
        togglableWordDataArrMemo={[
          { index: 0, endIndex: 0, surfaceForm: '你' },
          { index: 1, endIndex: 1, surfaceForm: '好' },
          { index: 2, endIndex: 3, surfaceForm: '世界' },
        ]}
        savingWordSpans={[
          { start: 0, end: 0, text: '你' },
          { start: 2, end: 3, text: '世界' },
        ]}
      />,
    );

    const spinners = screen.getAllByTestId('snippet-word-save-spinner');
    expect(spinners).toHaveLength(2);

    const selectedChunk = screen.getByTestId('formatted-chunk-0');
    const unselectedChunk = screen.getByTestId('formatted-chunk-2');
    const idleChunk = screen.getByTestId('formatted-chunk-1');

    expect(selectedChunk.parentElement).toContainElement(spinners[0]);
    expect(unselectedChunk.parentElement).toContainElement(spinners[1]);
    expect(
      idleChunk.parentElement?.querySelector(
        '[data-testid="snippet-word-save-spinner"]',
      ),
    ).toBeNull();
    expect(selectedChunk.parentElement?.className).toContain('overline');
    expect(unselectedChunk.parentElement?.className).not.toContain('overline');
    expect(unselectedChunk.parentElement?.className).toContain('animate-pulse');
  });
});
