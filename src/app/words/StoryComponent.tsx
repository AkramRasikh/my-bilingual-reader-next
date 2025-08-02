import { KaraokePlayer } from './KaraokePlayer';

const StoryComponent = ({ story }) => {
  return (
    <div className='flex flex-col gap-2 mb-2'>
      <KaraokePlayer
        originalText={story?.targetLang}
        audioUrl={story?.audioUrl}
        audioQuery={story?.audioQuery}
        katakanaSentence={story?.katakana}
        chunks={story?.chunks}
      />
      <div>
        <p className='mt-4 p-2 border rounded bg-gray-100 text-lg'>
          🇯🇵{story.targetLang}
        </p>
        <p className='mt-4 p-2 border rounded bg-gray-100 text-lg'>
          🇬🇧{story.baseLang}
        </p>
        {story?.notes && (
          <p className='mt-4 p-2 border rounded bg-gray-100 text-lg'>
            👀{story.notes}
          </p>
        )}
      </div>
    </div>
  );
};

export default StoryComponent;
