import Image from 'next/image';
import { Button } from '@/components/ui/button';

const HighlightedTextActions = ({ handleSaveFunc, isLoadingState }) => (
  <div className={'flex gap-1.5 m-auto'}>
    <Button
      data-testid='save-word-openai-button'
      className='border bg-transparent hover:bg-white'
      disabled={isLoadingState}
      size={'icon'}
      onClick={() => handleSaveFunc(false)}
    >
      <Image src='/openai.png' alt='Openai logo' height={25} width={25} />
    </Button>
    <Button
      data-testid='save-word-google-button'
      className='border bg-transparent hover:bg-white'
      disabled={isLoadingState}
      size={'icon'}
      onClick={() => handleSaveFunc(true)}
    >
      <Image src='/google.png' alt='Google logo' height={25} width={25} />
    </Button>
  </div>
);

export default HighlightedTextActions;
