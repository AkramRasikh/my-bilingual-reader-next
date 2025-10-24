import clsx from 'clsx';
import FormattedSentence from '../FormattedSentence';
import Image from 'next/image';
import { getCloudflareImageURL } from '@/utils/get-media-url';
import ReviewSRSToggles from '../ReviewSRSToggles';
import AudioPlayer from '@/app/SentenceAudioPlayer';

const SentenceBlock = ({
  thisSentencesWordsState,
  sentence,
  sentenceIndex,
  handleMouseLeave,
  handleMouseEnter,
  wordPopUpState,
  setWordPopUpState,
  handleDeleteWordDataProvider,
  wordsState,
  handleReviewFunc,
  wide,
  languageSelectedState,
  url,
}) => {
  return (
    <div
      className={clsx(
        'text-lg border rounded-2xl p-2 m-auto',
        wide ? 'w-full' : 'w-1/2',
      )}
    >
      <p className='flex gap-2 '>
        {sentenceIndex && <span>{sentenceIndex}</span>}
        <FormattedSentence
          ref={null}
          handleMouseLeave={handleMouseLeave}
          handleMouseEnter={handleMouseEnter}
          targetLangformatted={sentence?.targetLangformatted}
          wordPopUpState={wordPopUpState}
          setWordPopUpState={setWordPopUpState}
          handleDeleteWordDataProvider={handleDeleteWordDataProvider}
          wordsFromSentence={wordsState} // should be changed!
        />
      </p>
      <p className='text-right opacity-30'>{sentence.baseLang}</p>
      <AudioPlayer src={url} />
      {handleReviewFunc && (
        <ReviewSRSToggles
          contentItem={sentence}
          handleReviewFunc={handleReviewFunc}
        />
      )}
      {thisSentencesWordsState.length > 0 && (
        <ul>
          {thisSentencesWordsState?.map((wordItem, index) => {
            const imageUrl = wordItem?.imageUrl;
            const num = index + 1;
            return (
              <li key={index} className={'flex gap-1.5'}>
                <span
                  className={clsx(
                    'text-sm font-medium',
                    imageUrl ? 'm-auto' : '',
                  )}
                >
                  {num}) {wordItem.baseForm}, {wordItem.surfaceForm},{' '}
                  {wordItem.transliteration}, {wordItem.definition}
                </span>
                {imageUrl && (
                  <div className='relative w-4/5 h-30'>
                    <Image
                      src={getCloudflareImageURL(
                        imageUrl,
                        languageSelectedState,
                      )}
                      alt={wordItem.baseForm}
                      fill
                      className='object-contain'
                    />
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default SentenceBlock;
