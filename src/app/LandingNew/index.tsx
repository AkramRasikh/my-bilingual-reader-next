'use client';

import LandingUIContentSelectionItem from '../LandingUI/LandingUIContentSelectionItem';
import { useLandingNew } from './Provider/LandingNewProvider';

const languageFlags: Record<string, string> = {
  chinese: '🇨🇳',
  japanese: '🇯🇵',
  arabic: '🇸🇩',
  french: '🇫🇷',
};

const LandingNew = () => {
  const { languageContentMeta } = useLandingNew();

  return (
    <div className='p-4'>
      <div className='mt-4 space-y-4'>
        {languageContentMeta.length ? (
          languageContentMeta.map(({ language, contentMeta }) => (
            <section key={language}>
              <h2 className='text-2xl' title={language}>
                {languageFlags[language] || '🏳️'}
              </h2>
              <ul className='mt-2 flex flex-wrap gap-4'>
                {contentMeta.map((metaItem) => (
                  <li key={metaItem.title}>
                    <LandingUIContentSelectionItem {...metaItem} />
                  </li>
                ))}
              </ul>
            </section>
          ))
        ) : (
          <p className='text-sm text-gray-500'>
            No localStorage content found for supported languages.
          </p>
        )}
      </div>
    </div>
  );
};

export default LandingNew;
