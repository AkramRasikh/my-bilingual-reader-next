'use client';
import {
  ReactNode,
  createContext,
  useContext,
  useState,
  useEffect,
  useReducer,
  useMemo,
  SetStateAction,
  Dispatch,
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
import { underlineWordsInSentence } from '@/utils/underline-words-in-sentences';
import { breakdownSentenceAPI } from '../client-api/breakdown-sentence';
import { sentenceReviewBulkAPI } from '../client-api/bulk-sentence-review';
import { updateContentMetaDataAPI } from '../client-api/update-content-meta-data';
import { updateAdhocSentenceAPI } from '../client-api/update-adhoc-sentence';
import {
  getEmptyCard,
  getNextScheduledOptions,
  srsRetentionKeyTypes,
} from '../srs-utils/srs-algo';
import saveWordAPI from '../client-api/save-word';
import { deleteWordAPI } from '../client-api/delete-word';
import { updateSentenceDataAPI } from '../client-api/update-sentence-api';
import { getAudioURL } from '@/utils/get-media-url';
import useFetchInitData from './useFetchInitData';
import { deleteContentAPI } from '../client-api/delete-content';
import { useRouter } from 'next/navigation';
import { LanguageEnum } from '../languages';
import { SentenceTypes } from '../types/sentence-types';
import { WordTypes } from '../types/word-types';
import { ContentTranscriptTypes } from '../types/content-types';
import { ReviewDataTypes } from '../types/shared-types';
import { StoryTypes } from '../types/story-types';

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
interface UpdateContentMetaDataCallTypes {
  fieldToUpdate:
    | ContentStateTypes['nextReview']
    | ContentStateTypes['reviewHistory']
    | ContentStateTypes['snippets'];
  contentId: ContentStateTypes['id'];
  contentIndex: ContentStateTypes['contentIndex'];
}

interface StoryTypeStateTypes extends StoryTypes {
  isSaved?: boolean;
}

interface UpdateAdhocSentenceDataCallTypes {
  fieldToUpdate: Partial<SentenceTypes>;
  sentenceId: SentenceTypes['id'];
  isRemoveReview?: boolean;
}
interface HandleSaveWordCallTypes {
  highlightedWord: string;
  highlightedWordSentenceId: SentenceTypes['id'] | ContentStateTypes['id'];
  contextSentence?: string;
  meaning?: string;
  isGoogle?: boolean;
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
  fieldToUpdate: Partial<ContentTranscriptTypes>;
  contentIndex: ContentStateTypes['contentIndex'];
  indexKey: ContentStateTypes['id'];
  isRemoveReview?: boolean;
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

interface WordBasketTypes {
  id: WordTypes['id'];
  word: WordTypes['baseForm'];
  definition: WordTypes['definition'];
}

interface AddGeneratedSentenceCallTypes {
  targetLang: StoryTypeStateTypes['targetLang'];
  baseLang: StoryTypeStateTypes['baseLang'];
  notes?: StoryTypeStateTypes['notes'];
}

interface FetchDataContextTypes {
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
  updateAdhocSentenceData: (params: UpdateAdhocSentenceDataCallTypes) => void;
  handleSaveWord: (params: HandleSaveWordCallTypes) => void;
  handleDeleteWordDataProvider: (
    params: HandleDeleteWordDataProviderCallTypes,
  ) => void;
  updateWordDataProvider: (params: UpdateWordDataProviderCallTypes) => void;
  updateSentenceData: (params: UpdateSentenceDataCallTypes) => void;
  wordsToReviewOnMountState: number;
  addImageDataProvider: (params: AddImageDataProviderCallTypes) => void;
  wordsToReviewGivenOriginalContextId: Record<WordTypes['id'], WordTypes[]>;
  deleteContent: (params: DeleteContentCallTypes) => void;
  wordBasketState: WordBasketTypes[];
  setWordBasketState: Dispatch<SetStateAction<WordBasketTypes[]>>;
  story?: StoryTypeStateTypes;
  setStory: Dispatch<SetStateAction<StoryTypeStateTypes | undefined>>;
  addGeneratedSentence: (params: AddGeneratedSentenceCallTypes) => void;
}

const FetchDataContext = createContext<FetchDataContextTypes>({
  updateAdhocSentenceData: () => {},
  handleSaveWord: () => {},
  updateWordDataProvider: () => {},
  updateSentenceData: () => {},
  deleteContent: () => {},
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
  addGeneratedSentence: () => {},
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
  wordBasketState: [],
  setWordBasketState: () => {},
  setStory: () => {},
  wordsToReviewOnMountState: 0,
});

type FetchDataProviderProps = {
  children: ReactNode;
};
export function FetchDataProvider({ children }: FetchDataProviderProps) {
  const [languageSelectedState, setLanguageSelectedState] =
    useState<LanguageEnum>(LanguageEnum.None);
  const [languageOnMountState, setLanguageOnMountState] =
    useState<LanguageEnum>(LanguageEnum.None);
  const [hasFetchedDataState, setHasFetchedDataState] = useState(false);
  const [sentencesState, dispatchSentences] = useReducer(sentencesReducer, []);
  const [contentState, dispatchContent] = useReducer(contentReducer, []);
  const [wordsState, dispatchWords] = useReducer(wordsReducer, []);
  const [wordsToReviewOnMountState, setWordsToReviewOnMountState] = useState(0);
  const [wordBasketState, setWordBasketState] = useState<WordBasketTypes[]>([]);
  const [toastMessageState, setToastMessageState] = useState('');
  const [story, setStory] = useState<StoryTypeStateTypes>();
  const isSetOneTime = useRef(true);
  const router = useRouter();

  useLanguageSelector({
    languageSelectedState,
    setLanguageOnMountState,
    languageOnMountState,
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
    wordsState?.forEach((wordData) => {
      if (wordData?.baseForm) {
        pureWords.push(wordData.baseForm);
      }
      if (wordData?.surfaceForm) {
        pureWords.push(wordData.surfaceForm);
      }
    });

    sentencesState?.forEach((sentence) => {
      if (sentence?.matchedWordsSurface) {
        sentence?.matchedWordsSurface.forEach((item) => {
          if (item && !pureWords.includes(item)) {
            pureWords.push(item);
          }
        });
      }
    });
    const pureWordsUnique =
      pureWords?.length > 0 ? makeWordArrayUnique(pureWords) : [];
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
        targetLangformatted: underlineWordsInSentence(
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
      const resObj = await breakdownSentenceAPI({
        indexKey,
        sentenceId,
        targetLang,
        language: languageSelectedState,
      });

      dispatchContent({
        type: 'updateSentence',
        contentIndex,
        sentenceId,
        fields: { ...resObj },
      });
      setToastMessageState('Sentence broken down 🧱🔨!');
      return true;
    } catch (error) {
      console.log('## breakdownSentence', { error });
      setToastMessageState('Sentence breakdown error 🧱🔨❌');
    }
  };

  const sentenceReviewBulk = async ({
    reviewData,
    contentIndex,
    sentenceIds,
    contentId,
  }: SentenceReviewBulkCallTypes) => {
    try {
      const resUpdatedSentenceIds = await sentenceReviewBulkAPI({
        contentId,
        language: languageSelectedState,
        reviewData,
        sentenceIds,
      });
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
      const resObj = await updateContentMetaDataAPI({
        fieldToUpdate,
        language: languageSelectedState,
        contentId,
      });

      if (resObj) {
        setToastMessageState('Updated content data ✅!');
        dispatchContent({
          type: 'updateMetaData',
          contentIndex,
          fields: fieldToUpdate, // shouldn't really be like this
        });
        return true;
      }
    } catch (error) {
      console.log('## updateContentMetaData', { error });
      setToastMessageState('Error updating content data ❌');
    }
  };

  const updateAdhocSentenceData = async ({
    sentenceId,
    fieldToUpdate,
    isRemoveReview,
  }: UpdateAdhocSentenceDataCallTypes) => {
    try {
      const updatedFieldFromDB = await updateAdhocSentenceAPI({
        sentenceId,
        fieldToUpdate,
        language: languageSelectedState,
      });

      if (updatedFieldFromDB) {
        dispatchSentences({
          type: 'updateSentence',
          sentenceId,
          isRemoveReview,
          updatedFieldFromDB,
        });

        setToastMessageState(
          isRemoveReview
            ? 'Successful learned sentence ✅'
            : 'Sentence reviewed ✅',
        );
      }
    } catch (error) {
      console.log('## updateAdhocSentenceData', { error });
      setToastMessageState('Error updating adhoc-sentence sentence ❌');
    }
  };
  const handleDeleteWordDataProvider = async ({ wordId }) => {
    try {
      await deleteWordAPI({ wordId, language: languageSelectedState });
      dispatchWords({ type: 'removeWord', wordId });
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
      const updatedFieldFromDB = await updateSentenceDataAPI({
        indexKey,
        sentenceId,
        fieldToUpdate,
        language: languageSelectedState,
      });

      if (isRemoveReview) {
        dispatchContent({
          type: 'removeReview',
          contentIndex,
          sentenceId,
        });
      } else {
        const { reviewData } = updatedFieldFromDB;
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
      return updatedFieldFromDB?.reviewData;
    } catch (error) {
      console.log('## updateSentenceData', { error });
      setToastMessageState('Error updating sentence ❌');
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
        const res = await fetch('/api/updateWord', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: wordId,
            fieldToUpdate,
            language: languageSelectedState,
          }),
        });

        const data = await res.json();
        dispatchWords({
          type: 'updateWord',
          wordId,
          data,
        });
        setToastMessageState('Word reviewed ✅');
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
      const deleteSuccess = await deleteContentAPI({
        contentId,
        title,
        language: languageSelectedState,
        wordIds,
      });
      if (deleteSuccess) {
        router.push('/');
        dispatchContent({
          type: 'deleteContent',
          id: contentId,
        });
        if (wordIds) {
          dispatchWords({
            type: 'removeWords',
            ids: wordIds,
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
  }: HandleSaveWordCallTypes) => {
    try {
      const cardDataRelativeToNow = getEmptyCard();
      const nextScheduledOptions = getNextScheduledOptions({
        card: cardDataRelativeToNow,
        contentType: srsRetentionKeyTypes.vocab,
      });

      const savedWord = await saveWordAPI({
        highlightedWord,
        highlightedWordSentenceId,
        contextSentence,
        reviewData: nextScheduledOptions['1'].card,
        meaning,
        isGoogle,
        language: languageSelectedState,
      });

      if (savedWord) {
        dispatchWords({
          type: 'addWord',
          word: savedWord, // can be one or multiple
        });
        setToastMessageState(`${highlightedWord} saved!`);
        return savedWord;
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

  const addGeneratedSentence = async ({
    targetLang,
    baseLang,
    notes,
  }: AddGeneratedSentenceCallTypes) => {
    try {
      if (!story) {
        return;
      }
      const res = await fetch('/api/addSentence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          language: languageSelectedState,
          targetLang,
          baseLang,
          localAudioPath: story.audioUrl,
          notes,
        }),
      });
      const data = await res.json();

      console.log('## addGeneratedSentence data', data);

      if (data) {
        setStory({
          ...story,
          isSaved: true,
          audioUrl: getAudioURL(data[0].id, languageSelectedState),
        });
        dispatchSentences({ type: 'addSentence', sentence: data });
        setToastMessageState('Generated sentence saved ✅🤖!');
      }
    } catch (error) {
      console.log('## addGeneratedSentence', { error });
      setToastMessageState(`Failed to save generated sentence ❌`);
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
        wordBasketState,
        setWordBasketState,
        breakdownSentence,
        sentenceReviewBulk,
        updateContentMetaData,
        toastMessageState,
        setToastMessageState,
        story,
        setStory,
        updateAdhocSentenceData,
        handleSaveWord,
        handleDeleteWordDataProvider,
        updateWordDataProvider,
        updateSentenceData,
        addGeneratedSentence,
        addImageDataProvider,
        wordsToReviewOnMountState,
        wordsToReviewGivenOriginalContextId,
        deleteContent,
      }}
    >
      {children}
    </FetchDataContext.Provider>
  );
}

export function useFetchData() {
  return useContext(FetchDataContext);
}
