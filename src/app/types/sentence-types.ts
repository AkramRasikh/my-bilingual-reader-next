import { ReviewDataTypes } from './shared-types';

export interface SentenceTypes {
  id: string;
  baseLang: string;
  hasAudio: boolean;
  targetLang: string;
  topic: Topic; // think this one through
  matchedWordsId?: string[];
  matchedWordsSurface?: string[];
  reviewData?: ReviewDataTypes;
  baseSentence?: string;
  context?: string;
  isGrammar?: boolean;
  notes?: string;
  pairingType?: string;
}

export enum Topic {
  SentenceHelper = 'sentence-helper',
}
