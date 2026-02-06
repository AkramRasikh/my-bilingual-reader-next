import type { Meta, StoryObj } from '@storybook/react';
import { useEffect, useMemo } from 'react';
import type { ReactNode } from 'react';
import { LearningScreenProvider } from './LearningScreenProvider';
import LearningScreenKeyListener from './LearningScreenKeyListener';
import useLearningScreen from './useLearningScreen';
import { FetchDataContext } from '../Providers/FetchDataProvider';
import TranscriptItem from '@/components/custom/TranscriptItem';
import { TranscriptItemProvider } from '@/components/custom/TranscriptItem/TranscriptItemProvider';
import getBiggestOverlap from '@/components/custom/TranscriptItem/get-biggest-overlap';
import { useFetchData } from '../Providers/FetchDataProvider';
import {
  buildMockFetchContextArabic,
  buildMockFetchContextChinese,
  buildMockFetchContextFrench,
  buildMockFetchContextJapanese,
  mockSelectedContentArabic,
  mockSelectedContentChinese,
  mockSelectedContentFrench,
  mockSelectedContentJapanese,
} from './LearningScreen.stories.mocks';

const MockFetchProvider = ({
  children,
  fetchContextValue,
}: {
  children: ReactNode;
  fetchContextValue: ReturnType<typeof buildMockFetchContext>;
}) => (
  <FetchDataContext.Provider value={fetchContextValue}>
    {children}
  </FetchDataContext.Provider>
);

const MockMediaElement = () => {
  const { ref, handleLoadedMetadata } = useLearningScreen();

  useEffect(() => {
    if (!ref.current) {
      return;
    }

    Object.defineProperty(ref.current, 'duration', {
      value: 15,
      configurable: true,
    });

    handleLoadedMetadata();
  }, [handleLoadedMetadata, ref]);

  return <audio ref={ref} preload='metadata' />;
};

const StoryControls = () => {
  const {
    threeSecondLoopState,
    setThreeSecondLoopState,
    setContractThreeSecondLoopState,
    contractThreeSecondLoopState,
    overlappingSnippetDataState,
  } = useLearningScreen();

  return (
    <div className='flex flex-wrap items-center gap-2 rounded-md border p-3 text-sm'>
      <button
        className='rounded bg-gray-900 px-3 py-1 text-white'
        onClick={() => setThreeSecondLoopState(4)}
      >
        Loop at 4s
      </button>
      <button
        className='rounded bg-gray-900 px-3 py-1 text-white'
        onClick={() => setThreeSecondLoopState(8)}
      >
        Loop at 8s
      </button>
      <button
        className='rounded bg-gray-900 px-3 py-1 text-white'
        onClick={() => setThreeSecondLoopState(12)}
      >
        Loop at 12s
      </button>
      <button
        className='rounded bg-gray-200 px-3 py-1'
        onClick={() => setThreeSecondLoopState(null)}
      >
        Clear loop
      </button>
      <button
        className='rounded bg-gray-200 px-3 py-1'
        onClick={() => setContractThreeSecondLoopState((prev) => !prev)}
      >
        Contract: {contractThreeSecondLoopState ? 'On' : 'Off'}
      </button>
      <span>Loop time: {threeSecondLoopState ?? 'none'}</span>
      <span>Overlaps: {overlappingSnippetDataState.length}</span>
    </div>
  );
};

const LearningScreenTranscriptHarness = () => {
  const {
    threeSecondLoopState,
    overlappingSnippetDataState,
    masterPlay,
    isGenericItemsLoadingArrayState,
    isBreakingDownSentenceArrState,
    isInReviewMode,
    onlyShowEngState,
    setLoopTranscriptState,
    loopTranscriptState,
    handleReviewFunc,
    isVideoPlaying,
    handlePause,
    handleFromHere,
    handleBreakdownSentence,
    scrollToElState,
    wordsForSelectedTopic,
    learnFormattedTranscript,
    handleDeleteSnippet,
    savedSnippetsMemoized,
    setThreeSecondLoopState,
    setContractThreeSecondLoopState,
    handlePlayFromHere,
    overlappingTextMemoized,
    handleSaveSnippet,
    selectedContentTitleState,
    snippetLoadingState,
  } = useLearningScreen();

  const {
    languageSelectedState,
    wordsState,
    handleSaveWord,
    handleDeleteWordDataProvider,
  } = useFetchData();

  const biggestOverlappedSnippet = useMemo(() => {
    if (overlappingSnippetDataState.length === 0) {
      return null;
    }
    if (overlappingSnippetDataState.length > 1) {
      return getBiggestOverlap(overlappingSnippetDataState).id;
    }
    return overlappingSnippetDataState[0].id;
  }, [overlappingSnippetDataState]);

  return (
    <div className='space-y-4'>
      <StoryControls />
      <ul className='flex flex-col gap-2'>
        {learnFormattedTranscript.map((contentItem, index) => (
          <li key={contentItem.id}>
            <TranscriptItemProvider
              indexNum={index}
              threeSecondLoopState={threeSecondLoopState}
              overlappingSnippetDataState={overlappingSnippetDataState}
              contentItem={contentItem}
              masterPlay={masterPlay}
              isGenericItemsLoadingArrayState={isGenericItemsLoadingArrayState}
              handleSaveWord={handleSaveWord}
              handleDeleteWordDataProvider={handleDeleteWordDataProvider}
              wordsState={wordsState}
              isInReviewMode={isInReviewMode}
              onlyShowEngState={onlyShowEngState}
              setLoopTranscriptState={setLoopTranscriptState}
              loopTranscriptState={loopTranscriptState}
              handleReviewFunc={handleReviewFunc}
              isVideoPlaying={isVideoPlaying}
              handlePause={handlePause}
              handleFromHere={handleFromHere}
              handleBreakdownSentence={handleBreakdownSentence}
              isBreakingDownSentenceArrState={isBreakingDownSentenceArrState}
              scrollToElState={scrollToElState}
              wordsForSelectedTopic={wordsForSelectedTopic}
              languageSelectedState={languageSelectedState}
              savedSnippetsMemoized={savedSnippetsMemoized}
              handleDeleteSnippet={handleDeleteSnippet}
              setThreeSecondLoopState={setThreeSecondLoopState}
              setContractThreeSecondLoopState={setContractThreeSecondLoopState}
              handlePlayFromHere={handlePlayFromHere}
              biggestOverlappedSnippet={biggestOverlappedSnippet}
              overlappingTextMemoized={overlappingTextMemoized}
              handleSaveSnippet={handleSaveSnippet}
              originalContext={selectedContentTitleState}
              snippetLoadingState={snippetLoadingState}
            >
              <TranscriptItem />
            </TranscriptItemProvider>
          </li>
        ))}
      </ul>
    </div>
  );
};

const LearningScreenStoryRoot = ({
  selectedContent,
  fetchContextValue,
}: {
  selectedContent: typeof mockSelectedContentJapanese;
  fetchContextValue: ReturnType<typeof buildMockFetchContext>;
}) => (
  <MockFetchProvider fetchContextValue={fetchContextValue}>
    <LearningScreenProvider selectedContentStateMemoized={selectedContent}>
      <div className='p-4 space-y-4'>
        <LearningScreenKeyListener />
        <MockMediaElement />
        <LearningScreenTranscriptHarness />
      </div>
    </LearningScreenProvider>
  </MockFetchProvider>
);

const LearningScreenStoryRootJapanese = () => (
  <LearningScreenStoryRoot
    selectedContent={mockSelectedContentJapanese}
    fetchContextValue={buildMockFetchContextJapanese(
      mockSelectedContentJapanese,
    )}
  />
);

const LearningScreenStoryRootArabic = () => (
  <LearningScreenStoryRoot
    selectedContent={mockSelectedContentArabic}
    fetchContextValue={buildMockFetchContextArabic(mockSelectedContentArabic)}
  />
);

const LearningScreenStoryRootChinese = () => (
  <LearningScreenStoryRoot
    selectedContent={mockSelectedContentChinese}
    fetchContextValue={buildMockFetchContextChinese(
      mockSelectedContentChinese,
    )}
  />
);

const LearningScreenStoryRootFrench = () => (
  <LearningScreenStoryRoot
    selectedContent={mockSelectedContentFrench}
    fetchContextValue={buildMockFetchContextFrench(mockSelectedContentFrench)}
  />
);

const meta = {
  title: 'LearningScreen/LearningScreen',
  component: LearningScreenStoryRootJapanese,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof LearningScreenStoryRoot>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Minimal: Story = {
  render: () => <LearningScreenStoryRootJapanese />,
};

export const MinimalArabic: Story = {
  render: () => <LearningScreenStoryRootArabic />,
};

export const MinimalChinese: Story = {
  render: () => <LearningScreenStoryRootChinese />,
};

export const MinimalFrench: Story = {
  render: () => <LearningScreenStoryRootFrench />,
};
