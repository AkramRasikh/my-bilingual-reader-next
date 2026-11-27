import { ReviewDataTypes } from './shared-types';
import { WordTypes } from './word-types';

export interface ContentTypes {
  id: string;
  content: ContentTranscriptTypes[];
  createdAt: Date;
  hasAudio: boolean;
  title: string;
  url: string;
  origin?: string;
  description?: string;
  nextReview?: Date;
  reviewHistory?: Date[];
  snippets?: Snippet[];
}

export interface ContentTranscriptTypes {
  id: string;
  baseLang: string;
  targetLang: string;
  time: number;
  meaning?: string;
  reviewData?: ReviewDataTypes;
  sentenceStructure?: string;
  transliteration?: string;
  vocab?: Vocab[];
  structures?: string[]; // matched breakdown rule keys, e.g. "constructions.subjunctive"
}

export interface TargetLangFormattedChunk {
  text: string;
  savedWords: string[];
}

export interface FormattedTranscriptTypes extends ContentTranscriptTypes {
  isDue: boolean;
  targetLangformatted: TargetLangFormattedChunk[];
  wordsFromSentence?: WordTypes[];
  helperReviewSentence: boolean;
}

export interface SentenceMapItemTypes extends FormattedTranscriptTypes {
  index: number;
  prevSentence: number | null;
  thisSentence: number;
  isUpForReview: boolean;
  nextSentence: number | null;
}

export interface Vocab {
  meaning: string;
  surfaceForm: string;
}

export interface Snippet {
  id: string;
  baseLang: string;
  targetLang: string;
  time: number;
  reviewData?: ReviewDataTypes;
  focusedText?: string;
  isContracted?: boolean;
  isPreSnippet?: boolean;
  suggestedFocusText?: string;
  vocab?: Vocab[];
  /** Custom sentence snippets only: absolute media seconds. */
  start?: number;
  end?: number;
  /** 'sentence' marks a custom clip made while reviewing a sentence. */
  origin?: 'sentence';
  /** The sentence that was playing when the clip was created. Never changes. */
  sentenceId?: string;
}
