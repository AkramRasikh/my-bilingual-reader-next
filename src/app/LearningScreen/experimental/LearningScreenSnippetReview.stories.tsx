import type { Meta, StoryObj } from '@storybook/react';
import type { ReactNode } from 'react';
import { LearningScreenProvider } from '../LearningScreenProvider';
import { FetchDataContext } from '@/app/Providers/FetchDataProvider';
import LearningScreenSnippetReview from './LearningScreenSnippetReview';
import type { Snippet } from '@/app/types/content-types';
import {
  buildMockFetchContextJapanese,
  mockSelectedContentJapanese,
} from '../LearningScreen.stories.mocks';

const MockFetchProvider = ({
  children,
}: {
  children: ReactNode;
}) => (
  <FetchDataContext.Provider
    value={buildMockFetchContextJapanese(mockSelectedContentJapanese)}
  >
    {children}
  </FetchDataContext.Provider>
);

interface StoryRootProps {
  snippetData: Snippet;
  isVideoPlaying?: boolean;
  threeSecondLoopState?: number | null;
  isReadyForQuickReview?: boolean;
}

const LearningScreenSnippetReviewStoryRoot = ({
  snippetData,
  isVideoPlaying = false,
  threeSecondLoopState = null,
  isReadyForQuickReview = false,
}: StoryRootProps) => (
  <MockFetchProvider>
    <LearningScreenProvider selectedContentStateMemoized={mockSelectedContentJapanese}>
      <div className='max-w-3xl p-4'>
        <LearningScreenSnippetReview
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

const baseSnippet: Snippet = {
  id: 'snippet-story-001',
  baseLang: 'How are you? I hope things are going well lately.',
  targetLang: 'お元気ですか？最近はうまくいっていますか。',
  time: 4,
  suggestedFocusText: 'お元気ですか',
  isContracted: false,
};

const meta = {
  title: 'LearningScreen/LearningScreenSnippetReview',
  component: LearningScreenSnippetReviewStoryRoot,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof LearningScreenSnippetReviewStoryRoot>;

export default meta;

type Story = StoryObj<typeof meta>;

export const PreSnippet: Story = {
  args: {
    snippetData: {
      ...baseSnippet,
      isPreSnippet: true,
    },
  },
};

export const FinalizedSnippet: Story = {
  args: {
    snippetData: {
      ...baseSnippet,
      focusedText: '最近はうまくいっていますか',
      isPreSnippet: false,
    },
    isReadyForQuickReview: true,
  },
};
