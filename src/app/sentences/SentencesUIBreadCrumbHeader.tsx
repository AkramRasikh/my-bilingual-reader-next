import BreadCrumbHeaderBase from '@/components/BreadCrumbHeaderBase';
import ProgressHeader from '@/components/custom/ProgressHeader';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useSentencesUIScreen } from './SentencesUIProvider';

const SentencesUIBreadCrumbHeader = () => {
  const { progressState, initNumState, numberOfSentences } =
    useSentencesUIScreen();
  const numberOfStudiedSentences = initNumState - numberOfSentences;

  const progressText = `${numberOfStudiedSentences}/${initNumState}`;

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
      href="/"
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

export default SentencesUIBreadCrumbHeader;

