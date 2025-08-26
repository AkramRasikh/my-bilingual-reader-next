import { Button } from '@/components/ui/button';
import { useState } from 'react';
import useData from './useData';
import LoadingSpinner from './LoadingSpinner';
import { KaraokePlayer } from './words/KaraokePlayer';
import StoryComponent from './words/StoryComponent';

const DialogueHomeScreen = () => {
  const [loading, setLoading] = useState(false);

  const { story, setStory, wordBasketState, addGeneratedSentence } = useData();

  console.log('## story', story);

  const getStoryAPI = async ({ isStory }) => {
    setLoading(true);
    try {
      setLoading(true);
      const res = await fetch(
        isStory ? '/api/getAiStory' : '/api/getDialogue',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ words: wordBasketState, speakerId: 37 }),
        },
      );

      const data = await res.json();
      console.log('## data', data);

      if (data) {
        setStory(data);
      } else {
        setStory('No story returned.');
      }
    } catch (error) {
      console.error('Error fetching story:', error);
      setStory('Error fetching story.');
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className='flex gap-2'>
      <div className='flex gap-1.5 relative'>
        {loading && (
          <div className='absolute inset-0 flex items-center justify-center bg-white/70 rounded'>
            <LoadingSpinner />
          </div>
        )}
      </div>
      <Button variant='destructive' onClick={() => setWordBasketState([])}>
        Clear Basket
      </Button>

      {story ? (
        <Button variant='destructive' onClick={() => setStory()}>
          Clear Story
        </Button>
      ) : (
        <div className='flex gap-2'>
          <Button onClick={() => getStoryAPI({ isStory: true })}>
            Get Story!
          </Button>
          <Button onClick={() => getStoryAPI({ isStory: false })}>
            Get Dialogue
          </Button>
        </div>
      )}
      {story?.audioUrl && (
        <KaraokePlayer
          audioUrl={story?.audioUrl}
          dialogueOutput={story?.dialogueOutput}
        />
      )}
      {story && (
        <StoryComponent
          story={story}
          addGeneratedSentence={addGeneratedSentence}
          wordBasketState={wordBasketState}
        />
      )}
    </div>
  );
};

export default DialogueHomeScreen;
