import { Card, State } from 'ts-fsrs';

export interface ReviewDataTypes extends Card {
  ease?: number;
  interval?: number;
  state: State;
}

export interface OverlappingSnippetData {
  id: string;
  start: number;
  end: number;
  percentageOverlap: number;
  targetLang: string;
  startPoint: number;
  overlappedSeconds?: number[];
  sentenceSeconds?: number[];
}
