import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';

import { Button } from '@/components/ui/button';

const SentenceBreakdownHover = ({
  handleSaveFunc,
  surfaceForm,
  meaning,
  color,
  wordIsSaved,
}) => {
  return (
    <HoverCard>
      <HoverCardTrigger
        asChild
        style={{
          textDecorationLine: wordIsSaved ? 'underline' : '',
        }}
      >
        <span
          style={{
            color,
          }}
        >
          {surfaceForm}
        </span>
      </HoverCardTrigger>
      <HoverCardContent className='w-fit p-2 flex gap-3'>
        <Button
          variant='secondary'
          size='icon'
          onClick={() => handleSaveFunc(false, surfaceForm, meaning)}
        >
          <img src='/deepseek.png' alt='Deepseek logo' />
        </Button>

        <Button
          variant='secondary'
          size='icon'
          onClick={() => handleSaveFunc(true, surfaceForm, meaning)}
        >
          <img src='/google.png' alt='Google logo' />
        </Button>
      </HoverCardContent>
    </HoverCard>
  );
};

export default SentenceBreakdownHover;
