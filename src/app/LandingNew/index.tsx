'use client';

import LandingUIContentSelectionItem from '../LandingUI/LandingUIContentSelectionItem';
import { useLandingNew } from './Provider/LandingNewProvider';
import { LanguageEnum } from '../languages';

const languageFlags: Record<string, string> = {
  chinese: '🇨🇳',
  japanese: '🇯🇵',
  arabic: '🇸🇩',
  french: '🇫🇷',
};

const LandingNew = () => {
  const { languageContentMeta } = useLandingNew();

  return (
    <div className='pb-4'>
      <div className='mt-4 space-y-4'>
        {languageContentMeta.length ? (
          languageContentMeta.map(({ language, contentMeta }, index) => (
            <section
              key={language}
              className={index === 0 ? '' : 'border-t pt-4'}
            >
              <ul className='mt-2 flex flex-wrap gap-4'>
                {contentMeta.map((metaItem) => (
                  <li key={metaItem.title}>
                    <LandingUIContentSelectionItem
                      {...metaItem}
                      language={language as LanguageEnum}
                      flagEmoji={languageFlags[language] || '🏳️'}
                    />
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
