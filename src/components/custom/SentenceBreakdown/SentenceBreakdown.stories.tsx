import type { Meta, StoryObj } from '@storybook/react';
import SentenceBreakdown from './index';
import { useState } from 'react';
import {
  baseSnippetChinese,
  mockOverlappingSnippetDataMemoisedChinese,
} from '@/app/LearningScreen/experimental/SnippetReview.mocks';

const mockVocab = mockOverlappingSnippetDataMemoisedChinese[0].vocab;
const mockThisSentencesSavedWords = [];
const mockHandleSaveFunc = () => {};
const mockHandleBreakdownSentence = () => Promise.resolve();

const StoryRoot = (args) => {
  const [languageSelectedState] = useState('chinese');
  return (
    <div className='max-w-3xl p-4'>
      <SentenceBreakdown
        {...args}
        languageSelectedState={languageSelectedState}
      />
    </div>
  );
};

const meta = {
  title: 'LearningScreen/SentenceBreakdown',
  component: StoryRoot,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof StoryRoot>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Chinese: Story = {
  args: {
    vocab: mockVocab,
    thisSentencesSavedWords: mockThisSentencesSavedWords,
    handleSaveFunc: mockHandleSaveFunc,
    meaning: baseSnippetChinese.meaning,
    isSnippetReview: true,
    handleBreakdownSentence: mockHandleBreakdownSentence,
  },
};
