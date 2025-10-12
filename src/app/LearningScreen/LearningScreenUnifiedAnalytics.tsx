import useLearningScreen from './useLearningScreen';

const LearningScreenUnifiedAnalytics = ({ repsPerMinState }) => {
  const { contentMetaDataState, contentMetaWordDataState, sentenceRepsState } =
    useLearningScreen();
  const sentencesNeedReview = contentMetaDataState[0]?.sentencesNeedReview;

  return (
    <div>
      <p className='text-xs font-medium m-auto w-fit'>
        Sentences: {sentencesNeedReview}
      </p>
      <p className='text-xs font-medium m-auto w-fit'>
        Words: {contentMetaWordDataState[0].length}
      </p>
      <hr className='my-1' />
      <p className='text-xs font-medium m-auto w-fit'>
        Reps: {sentenceRepsState}
      </p>
      {repsPerMinState && (
        <p className='text-xs font-medium m-auto w-fit'>
          Reps/Min: {repsPerMinState}
        </p>
      )}
    </div>
  );
};

export default LearningScreenUnifiedAnalytics;
