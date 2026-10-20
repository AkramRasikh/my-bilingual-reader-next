import Image from 'next/image';
import { Button } from '@/components/ui/button';

const focusIconClass =
  'size-7 rounded border-0 bg-blue-100 p-1 shadow-none hover:bg-blue-200';

const HighlightedTextActions = ({
  handleSaveFunc,
  isLoadingState,
  focusIcons = false,
}: {
  handleSaveFunc: (isGoogle: boolean) => void;
  isLoadingState?: boolean;
  focusIcons?: boolean;
}) => (
  <div className={'flex gap-1.5 m-auto'}>
    <Button
      data-testid='save-word-openai-button'
      className={
        focusIcons ? focusIconClass : 'border bg-transparent hover:bg-white'
      }
      disabled={isLoadingState}
      size={'icon'}
      onClick={() => handleSaveFunc(false)}
    >
      <Image
        src='/openai.png'
        alt='Openai logo'
        height={focusIcons ? 20 : 25}
        width={focusIcons ? 20 : 25}
      />
    </Button>
    <Button
      data-testid='save-word-google-button'
      className={
        focusIcons ? focusIconClass : 'border bg-transparent hover:bg-white'
      }
      disabled={isLoadingState}
      size={'icon'}
      onClick={() => handleSaveFunc(true)}
    >
      <Image
        src='/google.png'
        alt='Google logo'
        height={focusIcons ? 20 : 25}
        width={focusIcons ? 20 : 25}
      />
    </Button>
  </div>
);

export default HighlightedTextActions;
