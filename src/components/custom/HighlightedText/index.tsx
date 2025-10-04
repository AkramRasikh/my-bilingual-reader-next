import { Button } from '@/components/ui/button';
import { Delete } from 'lucide-react';
import AnimationWrapper from '../AnimationWrapper';

const HighlightedText = ({
  isLoadingState,
  handleSaveFunc,
  setHighlightedTextState,
  highlightedTextState,
}) => {
  return (
    <AnimationWrapper className='m-auto mt-1.5 flex gap-2.5 justify-end'>
      <p className='my-auto bg-blue-100 rounded px-1 text-sm'>
        {highlightedTextState}
      </p>
      <div className='flex gap-1.5 relative'>
        {isLoadingState && (
          <div className='absolute inset-0 flex items-center justify-center bg-white/70 rounded'>
            <LoadingSpinner />
          </div>
        )}
        <div className='flex gap-1.5 m-auto'>
          <button
            className='border'
            style={{
              padding: 5,
              borderRadius: 5,
            }}
            onClick={() => handleSaveFunc(false)}
          >
            <img src='/deepseek.png' alt='Deepseek logo' className='h-5' />
          </button>
          <button
            className='border'
            style={{
              padding: 5,
              borderRadius: 5,
            }}
            onClick={() => handleSaveFunc(true)}
          >
            <img src='/google.png' alt='Google logo' className='h-5' />
          </button>
          <Button
            variant='destructive'
            size='sm'
            onClick={() => setHighlightedTextState('')}
          >
            <Delete />
          </Button>
        </div>
      </div>
    </AnimationWrapper>
  );
};

export default HighlightedText;
