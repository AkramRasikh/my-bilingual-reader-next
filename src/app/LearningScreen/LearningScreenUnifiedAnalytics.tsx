import useLearningScreen from './useLearningScreen';

const LearningScreenUnifiedAnalytics = ({ sentenceRepsPerMinState }) => {
  const {
    contentMetaDataState,
    contentMetaWordDataState,
    sentenceRepsState,
    numberOfSentencesPendingOrDueState,
  } = useLearningScreen();
  const sentencesNeedReview = contentMetaDataState[0]?.sentencesNeedReview;

  return (
    <div>
      <p className='text-xs font-medium m-auto w-fit'>
        Sentences: {sentencesNeedReview}/{numberOfSentencesPendingOrDueState}
      </p>
      <p className='text-xs font-medium m-auto w-fit'>
        Words: {contentMetaWordDataState[0].length}
      </p>
      <hr className='my-1' />
      <p className='text-xs font-medium m-auto w-fit'>
        Reps: {sentenceRepsState}
      </p>
      {sentenceRepsPerMinState && (
        <p className='text-xs font-medium m-auto w-fit'>
          Reps/Min: {sentenceRepsPerMinState}
        </p>
      )}
    </div>
  );
};

export default LearningScreenUnifiedAnalytics;
