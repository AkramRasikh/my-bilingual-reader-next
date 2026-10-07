import { render, screen, within } from '@testing-library/react';
import { pinyin } from 'pinyin-pro';
import { chinese, japanese } from '@/app/languages';
import TranscriptItemSecondary from './TranscriptItemSecondary';
import { mockChineseContentItem } from './TranscriptItem.mocks';

jest.mock('../../../app/LearningScreen/useLearningScreen', () => () => ({
  selectedContentTitleState: 'topic',
}));

jest.mock('@/app/Providers/FetchDataProvider', () => ({
  useFetchData: () => ({ wordsState: [] }),
}));

const renderItem = (
  contentItem: typeof mockChineseContentItem,
  languageSelectedState: string,
) =>
  render(
    <TranscriptItemSecondary
      contentItem={contentItem}
      handleSaveWord={jest.fn()}
      handleDeleteWordDataProvider={jest.fn()}
      isBreakdownSentenceLoadingState={false}
      languageSelectedState={languageSelectedState}
    />,
  );

describe('TranscriptItemSecondary pinyin', () => {
  it('shows pinyin for a broken-down Chinese sentence', () => {
    renderItem(mockChineseContentItem, chinese);

    const container = screen.getByTestId('transcript-item-secondary');
    const pinyinLine = within(container).getByTestId(
      'transcript-item-secondary-pinyin',
    );
    expect(pinyinLine.textContent).toBe(
      pinyin(mockChineseContentItem.targetLang, {
        toneType: 'symbol',
        separator: '\u2009',
      }),
    );
    expect(pinyinLine.previousElementSibling).toHaveTextContent(
      mockChineseContentItem.baseLang,
    );
  });

  it('hides pinyin when the Chinese sentence has no breakdown', () => {
    renderItem(
      { ...mockChineseContentItem, sentenceStructure: undefined },
      chinese,
    );

    expect(
      screen.queryByTestId('transcript-item-secondary-pinyin'),
    ).not.toBeInTheDocument();
  });

  it('hides pinyin for a non-Chinese sentence that has a breakdown', () => {
    renderItem(mockChineseContentItem, japanese);

    expect(
      screen.queryByTestId('transcript-item-secondary-pinyin'),
    ).not.toBeInTheDocument();
  });
});
