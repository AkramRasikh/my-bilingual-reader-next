import { saveJsonToFile } from '@/utils/setup-mock-data';

export const content = 'content';
export const words = 'words';
export const snippets = 'snippets';
export const adhocSentences = 'adhocSentences';
export const sentences = 'sentences';

const getFormattedData = (loadedData) => {
  const getNestedObjectData = (thisRef) => {
    return loadedData.find((el) => {
      const dataKeys = Object.keys(el);
      if (dataKeys.includes(thisRef)) {
        return el;
      }
    });
  };

  const targetLanguageLoadedContent = getNestedObjectData(
    content,
  ).content.filter((item) => item !== null);

  const targetLanguageLoadedWords = getNestedObjectData(words)?.words || [];
  const targetLanguageLoadedSnippets =
    getNestedObjectData(snippets)?.snippets || [];
  const targetLanguageLoadedSentences =
    getNestedObjectData(sentences)?.sentences || [];

  const data = {
    content: targetLanguageLoadedContent,
    words: targetLanguageLoadedWords,
    snippets: targetLanguageLoadedSnippets,
    sentences: targetLanguageLoadedSentences,
  };

  return data;
};

export const getOnLoadData = async () => {
  const url = process.env.NEXT_PUBLIC_GET_ON_ALL_LOAD_URL as string;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Accept: 'application/json', //<----
      'Content-Type': 'application/json', //<---
    },
    body: JSON.stringify({
      language: 'japanese',
      refs: [content, words],
    }),
  });

  if (!res.ok) throw new Error('Failed to fetch data');
  const jsonData = await res.json();
  await saveJsonToFile(jsonData);

  const formattedData = getFormattedData(jsonData);
  return formattedData;
};

// export const getOnLoadData = async () => {
//   const url = process.env.NEXT_PUBLIC_GET_ON_ALL_LOAD_URL as string;

//   // const res = await fetch(url, {
//   //   method: 'POST',
//   //   headers: {
//   //     Accept: 'application/json', //<----
//   //     'Content-Type': 'application/json', //<---
//   //   },
//   //   body: JSON.stringify({
//   //     language: 'japanese',
//   //     refs: [content, snippets, words, sentences],
//   //   }),
//   // });

//   // if (!res.ok) throw new Error('Failed to fetch data');
//   // const jsonData = await res.json();

//   // const formattedData = getFormattedData(jsonData);
//   const formattedData = getFormattedData(await readJsonFromFile());
//   return formattedData;
// };
