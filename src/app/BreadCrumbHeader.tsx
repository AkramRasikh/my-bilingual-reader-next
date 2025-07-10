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
  } = useData();

  const handleOnHome = () => {
    setSelectedContentState(null);
    setGeneralTopicDisplayNameSelectedState('');
  };
  const handleThisGeneralTopic = () => {
    setSelectedContentState(null);
  };

  const title = selectedContentState?.title;
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
                {generalTopicDisplayNameSelectedState}
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
