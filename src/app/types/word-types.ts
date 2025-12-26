import { ReviewDataTypes } from './shared-types';

export interface WordTypes {
  id: string;
  baseForm: string;
  contexts: string[];
  definition: string;
  phonetic: string;
  reviewData: ReviewDataTypes;
  surfaceForm: string;
  transliteration: string;
  originalContext: string;
  isDue: boolean;
  notes?: string;
  imageUrl?: string;
  mnemonic?: string;
}
