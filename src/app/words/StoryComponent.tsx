import { Button } from '@/components/ui/button';
import { KaraokePlayer } from './KaraokePlayer';
import useWords from './useWords';

const StoryComponent = ({ story }) => {
  const { addGeneratedSentence, wordBasketState } = useWords();

  const wordsUsedInStory = wordBasketState.filter((i) =>
    story?.wordIds.includes(i.id),
  );

  return (
    <div className='flex flex-col gap-2 mb-2'>
      <KaraokePlayer
        audioUrl={story?.audioUrl}
        dialogueOutput={story?.dialogueOutput}
      />
      <div>
        {wordsUsedInStory?.length > 0 && (
          <p>{wordsUsedInStory.map((i) => i.word).join(', ')}</p>
        )}
        <p className='mt-4 p-2 border rounded bg-gray-100 text-lg'>
          🇯🇵{story.targetLang} {story?.isSaved ? '✅✅✅✅' : ''}
        </p>
        <p className='mt-4 p-2 border rounded bg-gray-100 text-lg'>
          🇬🇧{story.baseLang}
        </p>
        {story?.notes && (
          <p className='mt-4 p-2 border rounded bg-gray-100 text-lg'>
            👀{story.notes}
          </p>
        )}
        <Button
          disabled={story?.isSaved}
          onClick={async () =>
            await addGeneratedSentence({
              targetLang: story?.targetLang,
              baseLang: story?.baseLang,
              notes: story?.notes,
            })
          }
        >
          Add sentence
        </Button>
      </div>
    </div>
  );
};

export default StoryComponent;
