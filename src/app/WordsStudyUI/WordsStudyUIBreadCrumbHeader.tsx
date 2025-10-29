import BreadCrumbHeaderBase from '@/components/BreadCrumbHeaderBase';
import ProgressHeader from '@/components/custom/ProgressHeader';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useWordsStudyUIScreen } from './WordsStudyUIProvider';

const WordsStudyUIBreadCrumbHeader = () => {
  const router = useRouter();

  const { progressState, wordsForReviewMemoized, wordsToReviewOnMountState } =
    useWordsStudyUIScreen();

  const numberOfStudiedWords =
    wordsToReviewOnMountState - wordsForReviewMemoized.length;

  const progressText = `${numberOfStudiedWords}/${wordsToReviewOnMountState}`;

  const handleHomeClick = () => router.push('/');

  const addContent = {
    onClick: () => router.push('/youtube-upload'),
    variant: 'link',
    text: 'Add content',
  };
  const navigationButtons = [addContent];

  return (
    <BreadCrumbHeaderBase
      heading={'Home'}
      onClick={handleHomeClick}
      navigationButtons={() =>
        navigationButtons.map((item, index) => {
          return (
            <Button
              key={index}
              className='m-1.5'
              onClick={item.onClick}
              disabled={item.disabled}
              variant={item.variant}
            >
              {item.text}
            </Button>
          );
        })
      }
      progressHeaderComponent={() => (
        <ProgressHeader
          progressState={progressState}
          progressText={progressText}
        />
      )}
    />
  );
};

export default WordsStudyUIBreadCrumbHeader;
