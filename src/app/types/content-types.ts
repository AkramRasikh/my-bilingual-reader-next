import { ReviewDataTypes } from './shared-types';

export interface ContentTypes {
  id: string;
  content: ContentTranscriptTypes[];
  createdAt: Date;
  hasAudio: boolean;
  title: string;
  url?: string;
  origin?: string;
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
  vocab?: Vocab[];
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
  reviewData: ReviewDataTypes;
  focusedText?: string;
  isContracted?: boolean;
  isPreSnippet?: boolean;
  suggestedFocusText?: string;
}
