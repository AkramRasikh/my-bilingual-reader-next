import clsx from 'clsx';
import { useFetchData } from '../Providers/FetchDataProvider';
import { useState } from 'react';
import ClickAndConfirm from '@/components/custom/ClickAndConfirm';
import LoadingSpinner from '@/components/custom/LoadingSpinner';

const LandingUICheckLiveStatus = ({ subsection }) => {
  const [isLoadingState, setIsLoadingState] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const { deleteContent } = useFetchData();

  const handleDeleteContent = async () => {
    try {
      setIsLoadingState(true);
      await deleteContent({
        contentId: subsection.id,
        title: subsection.title,
      });
    } catch (error) {
      console.log('## handleDeleteContent error', error);
    } finally {
      setIsLoadingState(false);
    }
  };

  const squashedSentences = subsection.squashedSentences.length;
  const hasNoWords = squashedSentences === 0;

  return (
    <div
      className={clsx(
        'italic relative',
        hasNoWords ? 'text-red-300' : '',
        isLoadingState ? 'opacity-50' : '',
      )}
    >
      {isLoadingState && (
        <div className='absolute left-5/10 top-1/3'>
          <LoadingSpinner />
        </div>
      )}
      {subsection.title} id: {subsection.id} number of words:{' '}
      {squashedSentences}
      {hasNoWords && (
        <ClickAndConfirm
          showConfirm={showConfirm}
          setShowConfirm={setShowConfirm}
          onClick={handleDeleteContent}
          isLoadingState={isLoadingState}
        />
      )}
    </div>
  );
};

export default LandingUICheckLiveStatus;
