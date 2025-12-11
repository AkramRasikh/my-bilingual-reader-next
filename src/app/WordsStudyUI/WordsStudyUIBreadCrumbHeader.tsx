import BreadCrumbHeaderBase from '@/components/BreadCrumbHeaderBase';
import ProgressHeader from '@/components/custom/ProgressHeader';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useWordsStudyUIScreen } from './WordsStudyUIProvider';
import { useFetchData } from '../Providers/FetchDataProvider';

const WordsStudyUIBreadCrumbHeader = () => {
  const { wordsToReviewOnMountState, wordsForReviewMemoized } = useFetchData();
  const { progressState } = useWordsStudyUIScreen();

  const numberOfStudiedWords =
    wordsToReviewOnMountState - wordsForReviewMemoized.length;

  const progressText = `${numberOfStudiedWords}/${wordsToReviewOnMountState}`;

  const addContent = {
    href: '/youtube-upload',
    variant: 'link',
    text: 'Content',
  };
  const navigationButtons = [addContent];

  return (
    <BreadCrumbHeaderBase
      heading={'Home'}
      onClick={() => {}}
      href='/'
      navigationButtons={() =>
        navigationButtons.map((item, index) => {
          return (
            <Button
              key={index}
              className='m-1.5'
              variant={item.variant}
              asChild
            >
              <Link href={item.href}>{item.text}</Link>
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
