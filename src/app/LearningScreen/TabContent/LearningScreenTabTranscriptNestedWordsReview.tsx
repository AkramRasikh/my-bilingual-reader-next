import { useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import LearningScreenWordCard from './LearningScreenWordCard';

const LearningScreenTabTranscriptNestedWordsReview = ({
  topicWordsForReviewMemoized,
  withToggle = true,
}) => {
  const [showNestedRelevantWordsState, setShowNestedRelevantWordsState] =
    useState(true);
  return (
    <>
      {withToggle && (
        <div className='flex gap-2 m-auto justify-center p-1'>
          <Label className='text-sm font-medium'>Show Relevant Words</Label>
          <Switch
            checked={showNestedRelevantWordsState}
            onCheckedChange={setShowNestedRelevantWordsState}
          />
        </div>
      )}
      {showNestedRelevantWordsState && (
        <div className='text-center m-auto p-1.5'>
          <ul className='flex flex-wrap gap-2.5 m-auto'>
            {topicWordsForReviewMemoized.map((word, index) => {
              return (
                <LearningScreenWordCard
                  word={word}
                  key={word.id}
                  indexNum={index + 1}
                />
              );
            })}
          </ul>
        </div>
      )}
    </>
  );
};

export default LearningScreenTabTranscriptNestedWordsReview;
