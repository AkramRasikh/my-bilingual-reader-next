import type { Meta, StoryObj } from '@storybook/react';
import type { ReactNode } from 'react';
import { LearningScreenProvider } from '../LearningScreenProvider';
import { FetchDataContext } from '@/app/Providers/FetchDataProvider';
import type { FetchDataContextTypes } from '@/app/Providers/FetchDataProvider';
import type { Snippet } from '@/app/types/content-types';
import {
  buildMockFetchContextChinese,
  buildMockFetchContextJapanese,
  mockSelectedContentChinese,
  mockSelectedContentJapanese,
} from '../LearningScreen.stories.mocks';
import SnippetReview from './SnippetReview';
import {
  baseSnippetChinese,
  baseSnippetJapanese,
  testSquashedOverlappingSnippetDataChinese,
  testSquashedOverlappingSnippetDataJapanese,
} from './SnippetReview.mocks';

const MockFetchProvider = ({
  children,
  value,
}: {
  children: ReactNode;
  value: FetchDataContextTypes;
}) => (
  <FetchDataContext.Provider value={value}>
    {children}
  </FetchDataContext.Provider>
);

interface StoryRootProps {
  snippetData: Snippet;
  isVideoPlaying?: boolean;
  threeSecondLoopState?: number | null;
  isReadyForQuickReview?: boolean;
  fetchContextValue?: FetchDataContextTypes;
  selectedContentStateMemoized?:
    | typeof mockSelectedContentJapanese
    | typeof mockSelectedContentChinese;
}

const SnippetReviewStoryRoot = ({
  snippetData,
  isVideoPlaying = false,
  threeSecondLoopState = null,
  isReadyForQuickReview = false,
  fetchContextValue = buildMockFetchContextJapanese(
    mockSelectedContentJapanese,
  ),
  selectedContentStateMemoized = mockSelectedContentJapanese,
}: StoryRootProps) => (
  <MockFetchProvider value={fetchContextValue}>
    <LearningScreenProvider
      selectedContentStateMemoized={selectedContentStateMemoized}
    >
      <div className='max-w-3xl p-4'>
        <SnippetReview
          snippetData={snippetData}
          handleLoopHere={({ time, isContracted }) => {
            console.log('Loop here', { time, isContracted });
          }}
          isVideoPlaying={isVideoPlaying}
          threeSecondLoopState={threeSecondLoopState}
          handleUpdateSnippetComprehensiveReview={async ({
            snippetData: updatedSnippet,
            isRemoveReview,
          }) => {
            console.log('Update snippet review', {
              updatedSnippet,
              isRemoveReview,
            });
          }}
          isReadyForQuickReview={isReadyForQuickReview}
        />
      </div>
    </LearningScreenProvider>
  </MockFetchProvider>
);

const meta = {
  title: 'LearningScreen/SnippetReview',
  component: SnippetReviewStoryRoot,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof SnippetReviewStoryRoot>;

export default meta;

type Story = StoryObj<typeof meta>;

export const PreSnippet: Story = {
  args: {
    snippetData: {
      ...baseSnippetJapanese,
    },
  },
};

export const FinalizedSnippet: Story = {
  args: {
    snippetData: {
      ...testSquashedOverlappingSnippetDataJapanese,
    },
    isReadyForQuickReview: true,
  },
};

export const PreSnippetChinese: Story = {
  render: (args) => (
    <SnippetReviewStoryRoot
      {...args}
      fetchContextValue={buildMockFetchContextChinese(
        mockSelectedContentChinese,
      )}
      selectedContentStateMemoized={mockSelectedContentChinese}
    />
  ),
  args: {
    snippetData: {
      ...baseSnippetChinese,
    },
  },
};

export const FinalizedSnippetChinese: Story = {
  render: (args) => (
    <SnippetReviewStoryRoot
      {...args}
      fetchContextValue={buildMockFetchContextChinese(
        mockSelectedContentChinese,
      )}
      selectedContentStateMemoized={mockSelectedContentChinese}
    />
  ),
  args: {
    snippetData: {
      ...testSquashedOverlappingSnippetDataChinese,
    },
    isReadyForQuickReview: true,
  },
};
