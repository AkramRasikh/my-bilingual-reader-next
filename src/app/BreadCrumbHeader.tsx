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

const BreadcrumbComponent = () => {
  const {
    selectedContentState,
    generalTopicDisplayNameSelectedState,
    setSelectedContentState,
    setGeneralTopicDisplayNameSelectedState,
    checkHowManyOfTopicNeedsReview,
  } = useData();

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

  if (!generalTopicDisplayNameSelectedState) {
    return null;
  }

  return (
    <Breadcrumb>
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
  );
};

export default BreadcrumbComponent;
