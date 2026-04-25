'use client';

import { useLandingNew } from './Provider/LandingNewProvider';

const LandingNew = () => {
  const { languageContentTitles } = useLandingNew();

  return (
    <div className="p-4">
      <h1 className="text-2xl font-semibold">Landing New</h1>

      <div className="mt-4 space-y-4">
        {languageContentTitles.length ? (
          languageContentTitles.map(({ language, titles }) => (
            <section key={language}>
              <h2 className="text-lg font-medium capitalize">{language}</h2>
              <ul className="mt-2 list-inside list-disc text-sm">
                {titles.map((title) => (
                  <li key={title}>{title}</li>
                ))}
              </ul>
            </section>
          ))
        ) : (
          <p className="text-sm text-gray-500">
            No localStorage content found for supported languages.
          </p>
        )}
      </div>
    </div>
  );
};

export default LandingNew;
