'use client';
import {
  ReactNode,
  createContext,
  useContext,
  useState,
  useEffect,
  useReducer,
  useMemo,
  useRef,
} from 'react';
import useLanguageSelector from './useLanguageSelector';
import {
  SentenceActions,
  sentencesReducer,
} from '../reducers/sentences-reducer';
import {
  ContentAction,
  contentReducer,
  ContentStateTypes,
} from '../reducers/content-reducer';
import { WordActions, wordsReducer } from '../reducers/words-reducer';
import useDataSaveToLocalStorage from './useDataSaveToLocalStorage';
import { makeWordArrayUnique } from '@/utils/make-word-array-unique';
import { isDueCheck } from '@/utils/is-due-check';
import { underlineWordsInSentenceLegacy } from '@/utils/sentence-formatting/underline-words-in-sentences';
import {
  getEmptyCard,
  getNextScheduledOptions,
  srsRetentionKeyTypes,
} from '../srs-utils/srs-algo';
import useFetchInitData from './useFetchInitData';
import { useRouter } from 'next/navigation';
import { LanguageEnum } from '../languages';
import { SentenceTypes } from '../types/sentence-types';
import { WordTypes } from '../types/word-types';
import { ContentTranscriptTypes, Snippet } from '../types/content-types';
import { ReviewDataTypes } from '../types/shared-types';
import { apiRequestWrapper } from '@/lib/api-request-wrapper';

interface BreakDownSentenceCallTypes {
  indexKey: ContentStateTypes['id'];
  sentenceId: ContentTranscriptTypes['id'];
  targetLang: ContentTranscriptTypes['targetLang'];
  contentIndex: ContentStateTypes['contentIndex'];
}
interface SentenceReviewBulkCallTypes {
  reviewData: ReviewDataTypes;
  sentenceIds: ContentTranscriptTypes['id'][];
  contentId: ContentStateTypes['id'];
  contentIndex: ContentStateTypes['contentIndex'];
}

interface SentenceReviewBulkAPIResponseCallTypes {
  updatedSentenceIds: ContentTranscriptTypes['id'][];
  reviewData: ReviewDataTypes;
}

interface UpdateContentMetaDataCallTypes {
  fieldToUpdate: Partial<
    Pick<ContentStateTypes, 'nextReview' | 'reviewHistory' | 'snippets'>
  >;
  contentId: ContentStateTypes['id'];
  contentIndex: ContentStateTypes['contentIndex'];
}

interface HandleSaveWordCallTypes {
  highlightedWord: string;
  highlightedWordSentenceId: SentenceTypes['id'] | ContentStateTypes['id'];
  contextSentence?: string;
  meaning?: string;
  isGoogle?: boolean;
  originalContext?: string;
  time?: number;
}

interface HandleSaveWordResponseCallTypes {
  word: WordTypes;
}

interface HandleSaveSnippetCallTypes {
  snippetData: Snippet;
  contentId: ContentStateTypes['id'];
  contentIndex: ContentStateTypes['contentIndex'];
  isUpdate?: boolean;
}

interface HandleDeleteSnippetCallTypes {
  contentId: ContentStateTypes['id'];
  snippetId: Snippet['id'];
  contentIndex: ContentStateTypes['contentIndex'];
}

interface HandleDeleteWordDataProviderCallTypes {
  wordId: WordTypes['id'];
}
interface UpdateWordDataProviderCallTypes {
  wordId: WordTypes['id'];
  fieldToUpdate: Partial<WordTypes>;
  isRemoveReview?: boolean; /// why would this be needed?
}

interface UpdateSentenceDataCallTypes {
  sentenceId: ContentTranscriptTypes['id'];
  fieldToUpdate: Partial<ContentTranscriptTypes | { removeReview: boolean }>;
  contentIndex: ContentStateTypes['contentIndex'];
  indexKey: ContentStateTypes['id'];
  isRemoveReview?: boolean;
  topicName?: string;
}

interface AddImageDataProviderCallTypes {
  wordId: WordTypes['id'];
  formData: FormData;
}

interface DeleteContentCallTypes {
  contentId: ContentStateTypes['id'];
  title: ContentStateTypes['title'];
  wordIds?: WordTypes['id'][];
}

interface DeleteContentResponseCallTypes {
  id: ContentStateTypes['id'];
  deletedWordsIds?: WordTypes['id'][];
}

interface DeleteWordResponseTypes {
  id: WordTypes['id'];
}

export interface FetchDataContextTypes {
  languageSelectedState: LanguageEnum;
  setLanguageSelectedState: (lang: LanguageEnum) => void;
  pureWordsMemoized: string[];
  contentState: ContentStateTypes[];
  sentencesState: SentenceTypes[];
  wordsState: WordTypes[];
  hasFetchedDataState: boolean;
  dispatchSentences: React.Dispatch<SentenceActions>;
  dispatchContent: React.Dispatch<ContentAction>;
  dispatchWords: React.Dispatch<WordActions>;
  wordsForReviewMemoized: [] | WordTypes[];
  sentencesDueForReviewMemoized: [] | SentenceTypes[]; // extend for formattedLang
  breakdownSentence: (params: BreakDownSentenceCallTypes) => void;
  sentenceReviewBulk: (params: SentenceReviewBulkCallTypes) => void;
  updateContentMetaData: (params: UpdateContentMetaDataCallTypes) => void;
  toastMessageState: string;
  setToastMessageState: (param: string) => void;
  handleSaveWord: (params: HandleSaveWordCallTypes) => void;
  handleDeleteWordDataProvider: (
    params: HandleDeleteWordDataProviderCallTypes,
  ) => void;
  updateWordDataProvider: (params: UpdateWordDataProviderCallTypes) => void;
  updateSentenceData: (params: UpdateSentenceDataCallTypes) => boolean | void;
  wordsToReviewOnMountState: number;
  addImageDataProvider: (params: AddImageDataProviderCallTypes) => void;
  wordsToReviewGivenOriginalContextId: Record<WordTypes['id'], WordTypes[]>;
  deleteContent: (params: DeleteContentCallTypes) => void;
  deleteVideo: (filePath: string) => Promise<boolean>;
  handleSaveSnippetFetchProvider: (
    params: HandleSaveSnippetCallTypes,
  ) => Promise<void>;
  handleDeleteSnippetFetchProvider: (
    params: HandleDeleteSnippetCallTypes,
  ) => Promise<void>;
}

export const FetchDataContext = createContext<FetchDataContextTypes>({
  handleSaveWord: () => {},
  updateWordDataProvider: () => {},
  updateSentenceData: () => {},
  deleteContent: () => {},
  deleteVideo: async () => false,
  setLanguageSelectedState: () => {},
  dispatchSentences: () => {},
  dispatchContent: () => {},
  dispatchWords: () => {},
  breakdownSentence: () => {},
  sentenceReviewBulk: () => {},
  updateContentMetaData: () => {},
  setToastMessageState: () => {},
  handleDeleteWordDataProvider: () => {},
  addImageDataProvider: () => {},
  handleSaveSnippetFetchProvider: async () => {},
  handleDeleteSnippetFetchProvider: async () => {},
  wordsToReviewGivenOriginalContextId: {},
  languageSelectedState: LanguageEnum.None,
  contentState: [],
  sentencesState: [],
  wordsState: [],
  wordsForReviewMemoized: [],
  sentencesDueForReviewMemoized: [],
  toastMessageState: '',
  hasFetchedDataState: false,
  pureWordsMemoized: [],
  wordsToReviewOnMountState: 0,
});

type FetchDataProviderProps = {
  children: ReactNode;
};
export function FetchDataProvider({ children }: FetchDataProviderProps) {
  const [languageSelectedState, setLanguageSelectedState] =
    useState<LanguageEnum>(LanguageEnum.None);

  const [hasFetchedDataState, setHasFetchedDataState] = useState(false);
  const [sentencesState, dispatchSentences] = useReducer(sentencesReducer, []);
  const [contentState, dispatchContent] = useReducer(contentReducer, []);
  const [wordsState, dispatchWords] = useReducer(wordsReducer, []);
  const [wordsToReviewOnMountState, setWordsToReviewOnMountState] = useState(0);
  const [toastMessageState, setToastMessageState] = useState('');
  const isSetOneTime = useRef(true);
  const router = useRouter();

  useLanguageSelector({
    languageSelectedState,
    setLanguageSelectedState,
  });

  useFetchInitData({
    hasFetchedDataState,
    languageSelectedState,
    setHasFetchedDataState,
    dispatchWords,
    dispatchContent,
    dispatchSentences,
    setToastMessageState,
  });

  useDataSaveToLocalStorage({
    languageSelectedState,
    wordsState,
    sentencesState,
    contentState,
    hasFetchedDataState,
  });

  const pureWordsMemoized = useMemo((): string[] => {
    const pureWords: string[] = [];
    if (wordsState.length === 0) {
      return [];
    }

    wordsState.forEach((wordData) => {
      if (wordData.baseForm) {
        pureWords.push(wordData.baseForm);
      }
      if (wordData.surfaceForm) {
        pureWords.push(wordData.surfaceForm);
      }
    });

    if (sentencesState.length === 0) {
      return makeWordArrayUnique(pureWords);
    }

    sentencesState.forEach((sentence) => {
      if (sentence?.matchedWordsSurface) {
        sentence?.matchedWordsSurface.forEach((matchedWordsWordItem) => {
          if (
            matchedWordsWordItem &&
            !pureWords.includes(matchedWordsWordItem)
          ) {
            pureWords.push(matchedWordsWordItem);
          }
        });
      }
    });
    const pureWordsUnique = makeWordArrayUnique(pureWords);
    return pureWordsUnique;
  }, [wordsState, sentencesState]);

  const wordsForReviewMemoized = useMemo((): WordTypes[] => {
    const dateNow = new Date();
    const wordsForReview = wordsState.filter((item) => {
      if (isDueCheck(item, dateNow)) {
        return true;
      }
    });
    return wordsForReview;
  }, [wordsState]);

  const wordsToReviewGivenOriginalContextId = useMemo<
    Record<WordTypes['id'], WordTypes[]>
  >(() => {
    return wordsForReviewMemoized.reduce<Record<WordTypes['id'], WordTypes[]>>(
      (acc, obj) => {
        const key = obj.contexts[0];
        if (!acc[key]) {
          acc[key] = [];
        }
        acc[key].push(obj);
        return acc;
      },
      {},
    );
  }, [wordsForReviewMemoized]);

  useEffect(() => {
    if (isSetOneTime.current && wordsForReviewMemoized.length > 0) {
      setWordsToReviewOnMountState(wordsForReviewMemoized.length);
      isSetOneTime.current = false;
    }
  }, [wordsForReviewMemoized]);

  const sentencesDueForReviewMemoized = useMemo(() => {
    if (sentencesState.length === 0) {
      return [];
    }
    const dateNow = new Date();
    const dueCardsNow = sentencesState.filter((sentence) =>
      isDueCheck(sentence, dateNow),
    );

    const formatSentence = dueCardsNow?.map((item) => {
      return {
        ...item,
        targetLangformatted: underlineWordsInSentenceLegacy(
          item.targetLang,
          pureWordsMemoized,
        ), // should all be moved eventually to new sentence sphere
      };
    });

    return formatSentence;
  }, [sentencesState]);

  const breakdownSentence = async ({
    indexKey,
    sentenceId,
    targetLang,
    contentIndex,
  }: BreakDownSentenceCallTypes) => {
    try {
      const sentenceBreakdownRes = (await apiRequestWrapper({
        url: '/api/breakdownSentence',
        body: {
          id: sentenceId,
          indexKey,
          targetLang,
          language: languageSelectedState,
        },
      })) as Partial<ContentTranscriptTypes>;

      dispatchContent({
        type: 'updateSentence',
        contentIndex,
        sentenceId,
        fields: { ...sentenceBreakdownRes },
      });
      setToastMessageState('Sentence broken down 🧱🔨!');
      return true;
    } catch (error) {
      console.log('## breakdownSentence', { error });
      setToastMessageState('Sentence breakdown error 🧱🔨❌');
    }
  };

  const handleSaveSnippetFetchProvider = async ({
    snippetData,
    contentId,
    contentIndex,
    isUpdate,
  }: HandleSaveSnippetCallTypes) => {
    try {
      const saveSnippetResponse = (await apiRequestWrapper({
        url: '/api/saveSnippet',
        body: {
          language: languageSelectedState,
          contentId,
          snippetData,
        },
      })) as Snippet;

      dispatchContent({
        type: 'saveSnippet',
        contentIndex: contentIndex,
        snippetData: saveSnippetResponse,
        isUpdate,
      });
      setToastMessageState('Snippet saved ✂️✅!');
    } catch (error) {
      console.log('## handleSaveSnippetFetchProvider', { error });
      setToastMessageState('Error saving snippet ✂️❌!');
    }
  };

  const handleDeleteSnippetFetchProvider = async ({
    contentId,
    snippetId,
    contentIndex,
  }: HandleDeleteSnippetCallTypes) => {
    try {
      await apiRequestWrapper({
        url: '/api/deleteSnippet',
        body: {
          language: languageSelectedState,
          contentId,
          snippetId,
        },
      });
      dispatchContent({
        type: 'deleteSnippet',
        contentIndex: contentIndex,
        snippetId: snippetId,
      });
      setToastMessageState('Snippet deleted ✂️✅!');
    } catch (error) {
      console.log('## handleDeleteSnippetFetchProvider', { error });
      setToastMessageState('Error deleting snippet ✂️❌!');
    }
  };

  const sentenceReviewBulk = async ({
    reviewData,
    contentIndex,
    sentenceIds,
    contentId,
  }: SentenceReviewBulkCallTypes) => {
    try {
      const resUpdatedSentenceIds = (await apiRequestWrapper({
        url: '/api/bulkSentenceReview',
        body: {
          contentId,
          language: languageSelectedState,
          reviewData,
          sentenceIds,
        },
      })) as SentenceReviewBulkAPIResponseCallTypes;

      if (resUpdatedSentenceIds) {
        dispatchContent({
          type: 'updateSentences',
          contentIndex,
          sentenceIds: resUpdatedSentenceIds.updatedSentenceIds,
          fields: { reviewData: resUpdatedSentenceIds.reviewData },
        });
      }
      setToastMessageState(`Bulk reviewed ${sentenceIds.length} sentences ✅`);
    } catch (error) {
      console.log('## sentenceReviewBulk error', error);
      setToastMessageState('Error reviewing in BULK ❌');
    }
  };

  const updateContentMetaData = async ({
    fieldToUpdate,
    contentIndex,
    contentId,
  }: UpdateContentMetaDataCallTypes) => {
    try {
      // this should be updated as a function from the API
      const resObj = await apiRequestWrapper({
        url: '/api/updateContentMetaData',
        body: {
          fieldToUpdate,
          language: languageSelectedState,
          contentId,
        },
      });

      if (resObj) {
        dispatchContent({
          type: 'updateMetaData',
          contentIndex,
          fields: fieldToUpdate, // shouldn't really be like this
        });
        setToastMessageState('Updated content data ✅!');
        return true;
      }
    } catch (error) {
      console.log('## updateContentMetaData', { error });
      setToastMessageState('Error updating content data ❌');
    }
  };

  const handleDeleteWordDataProvider = async ({
    wordId,
  }: HandleDeleteWordDataProviderCallTypes) => {
    try {
      const deleteWordResponse = (await apiRequestWrapper({
        url: '/api/deleteWord',
        body: {
          id: wordId,
          language: languageSelectedState,
        },
      })) as DeleteWordResponseTypes;

      const deletedWordId = deleteWordResponse.id;
      dispatchWords({ type: 'removeWord', wordId: deletedWordId });
      setToastMessageState('Word deleted!');
      return true;
    } catch (error) {
      console.log('## handleDeleteWordDataProvider', { error });
      setToastMessageState('Error deleting word ❌');
    }
  };

  const updateSentenceData = async ({
    sentenceId,
    fieldToUpdate,
    contentIndex,
    isRemoveReview,
    indexKey,
  }: UpdateSentenceDataCallTypes) => {
    try {
      const updatedFieldFromDB = await apiRequestWrapper({
        url: '/api/updateSentence',
        body: {
          language: languageSelectedState,
          indexKey,
          id: sentenceId,
          fieldToUpdate,
        },
      });

      if (isRemoveReview) {
        dispatchContent({
          type: 'removeReview',
          contentIndex,
          sentenceId,
        });
      } else {
        const { reviewData } =
          updatedFieldFromDB as Partial<ContentTranscriptTypes>;
        dispatchContent({
          type: 'updateSentence',
          contentIndex,
          sentenceId,
          fields: { reviewData },
        });
      }

      setToastMessageState(
        isRemoveReview
          ? 'Successful learned sentence ✅'
          : 'Sentence reviewed ✅',
      );
      return true;
    } catch (error) {
      console.log('## updateSentenceData', { error });
      setToastMessageState('Error updating sentence review ❌');
    }
  };

  // check between this and handleDelete
  const updateWordDataProvider = async ({
    wordId,
    fieldToUpdate,
    isRemoveReview,
  }: UpdateWordDataProviderCallTypes) => {
    try {
      if (isRemoveReview) {
        const res = await fetch('/api/deleteWord', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: wordId, language: languageSelectedState }),
        });
        const data = await res.json();

        dispatchWords({ type: 'removeWord', wordId: data.id });
        setToastMessageState('Successful learned word ✅');
        return true;
      } else {
        const data = await apiRequestWrapper({
          url: '/api/updateWord',
          body: {
            id: wordId,
            fieldToUpdate,
            language: languageSelectedState,
          },
        });

        dispatchWords({
          type: 'updateWord',
          wordId,
          data,
        });
        setToastMessageState('Word updated ✅');
        return true;
      }
    } catch (error) {
      console.log('## updateWordDataProvider', { error });
      setToastMessageState('Error reviewing word ❌');
    }
  };

  const deleteContent = async ({
    contentId,
    title,
    wordIds,
  }: DeleteContentCallTypes) => {
    try {
      const deletedContentResponse = (await apiRequestWrapper({
        url: '/api/deleteContent',
        body: {
          id: contentId,
          title,
          language: languageSelectedState,
          wordIds,
        },
      })) as DeleteContentResponseCallTypes;

      const deletedContentId = deletedContentResponse.id;
      const deletedContentWordsId = deletedContentResponse?.deletedWordsIds;

      if (deletedContentId) {
        router.push('/');
        dispatchContent({
          type: 'deleteContent',
          id: contentId,
        });
        if (deletedContentWordsId) {
          dispatchWords({
            type: 'removeWords',
            ids: deletedContentWordsId,
          });
        }
        setToastMessageState(`Content deleted!`);
      }
    } catch (error) {
      console.log('## deleteContent', { error });
      setToastMessageState(`Failed to delete content 🫤❌`);
    }
  };

  const handleSaveWord = async ({
    highlightedWord,
    highlightedWordSentenceId,
    contextSentence,
    meaning,
    isGoogle,
    originalContext,
    time,
  }: HandleSaveWordCallTypes) => {
    try {
      const cardDataRelativeToNow = getEmptyCard();
      const nextScheduledOptions = getNextScheduledOptions({
        card: cardDataRelativeToNow,
        contentType: srsRetentionKeyTypes.vocab,
      });

      const savedWordResponse = (await apiRequestWrapper({
        url: '/api/saveWord',
        body: {
          language: languageSelectedState,
          word: highlightedWord,
          context: highlightedWordSentenceId,
          contextSentence,
          reviewData: nextScheduledOptions['1'].card,
          meaning,
          isGoogle,
        },
      })) as HandleSaveWordResponseCallTypes;

      const wordToSave = { ...savedWordResponse.word, originalContext, time };

      if (wordToSave) {
        dispatchWords({
          type: 'addWord',
          word: wordToSave, // can be one or multiple
        });
        setToastMessageState(`${highlightedWord} saved!`);
        return wordToSave;
      }
    } catch (error) {
      console.log('## handleSaveWord', { error });
      setToastMessageState(`Failed to save word 🫤❌`);
    }
  };

  const addImageDataProvider = async ({
    wordId,
    formData,
  }: AddImageDataProviderCallTypes) => {
    try {
      formData.append('language', languageSelectedState);
      const res = await fetch('/api/addWordImage', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data) {
        dispatchWords({
          type: 'updateWordData',
          wordId,
          fields: { imageUrl: data.imageUrl },
        });
        setToastMessageState('Image saved!');
      }
    } catch (error) {
      console.log('## addImageDataProvider', { error });
      setToastMessageState(`Failed to save image 🫤❌`);
    }
  };

  const deleteVideo = async (filePath: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/deleteVideo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filePath }),
      });

      if (!res.ok) {
        throw new Error('Failed to delete video');
      }

      setToastMessageState('Video successfully deleted');
      return true;
    } catch (error) {
      console.log('## deleteVideo error', error);
      setToastMessageState('Failed to delete video ❌');
      return false;
    }
  };

  return (
    <FetchDataContext.Provider
      value={{
        languageSelectedState,
        setLanguageSelectedState,
        dispatchSentences,
        dispatchContent,
        dispatchWords,
        sentencesState,
        contentState,
        wordsState,
        hasFetchedDataState,
        pureWordsMemoized,
        wordsForReviewMemoized,
        sentencesDueForReviewMemoized,
        breakdownSentence,
        sentenceReviewBulk,
        updateContentMetaData,
        toastMessageState,
        setToastMessageState,
        handleSaveWord,
        handleDeleteWordDataProvider,
        updateWordDataProvider,
        updateSentenceData,
        addImageDataProvider,
        wordsToReviewOnMountState,
        wordsToReviewGivenOriginalContextId,
        deleteContent,
        deleteVideo,
        handleSaveSnippetFetchProvider,
        handleDeleteSnippetFetchProvider,
      }}
    >
      {children}
    </FetchDataContext.Provider>
  );
}

export function useFetchData() {
  return useContext(FetchDataContext);
}
