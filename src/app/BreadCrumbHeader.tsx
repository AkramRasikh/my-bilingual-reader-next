'use client';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import useData from './useData';
import { Button } from '@/components/ui/button';

const BreadcrumbComponent = () => {
  const {
    selectedContentState,
    generalTopicDisplayNameSelectedState,
    setSelectedContentState,
    setGeneralTopicDisplayNameSelectedState,
    checkHowManyOfTopicNeedsReview,
    sentencesState,
    setIsSentenceReviewState,
    isSentenceReviewState,
  } = useData();

  const numberOfSentences = sentencesState.length;

  const theseSentencesDue =
    generalTopicDisplayNameSelectedState && checkHowManyOfTopicNeedsReview();

  const handleOnHome = () => {
    setSelectedContentState(null);
    setGeneralTopicDisplayNameSelectedState('');
  };
  const handleThisGeneralTopic = () => {
    setSelectedContentState(null);
  };

  const title = selectedContentState?.title;

  return (
    <div className='flex justify-between'>
      <Breadcrumb className='my-auto mx-1'>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink onClick={handleOnHome}>Topics</BreadcrumbLink>
          </BreadcrumbItem>
          {generalTopicDisplayNameSelectedState && (
            <>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink onClick={handleThisGeneralTopic}>
                  {generalTopicDisplayNameSelectedState}{' '}
                  {theseSentencesDue?.length > 0
                    ? `(${theseSentencesDue?.length})`
                    : null}
                </BreadcrumbLink>
              </BreadcrumbItem>
            </>
          )}
          {title && (
            <>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{title}</BreadcrumbPage>
              </BreadcrumbItem>
            </>
          )}
        </BreadcrumbList>
      </Breadcrumb>

      {!isSentenceReviewState ? (
        <Button
          className='m-1.5'
          onClick={() => setIsSentenceReviewState(true)}
          disabled={!(numberOfSentences > 0)}
          variant='secondary'
        >
          Sentence reviews ({numberOfSentences})
        </Button>
      ) : (
        <Button
          className='m-1.5'
          onClick={() => setIsSentenceReviewState(false)}
          variant='destructive'
        >
          Exit Sentence mode
        </Button>
      )}
    </div>
  );
};

export default BreadcrumbComponent;
