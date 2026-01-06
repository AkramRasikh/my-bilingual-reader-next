export interface ReviewDataTypes {
  difficulty: number;
  due: Date;
  ease: number;
  elapsed_days: number;
  interval: number;
  lapses: number;
  last_review: Date;
  reps: number;
  scheduled_days: number;
  stability: number;
  state: number;
}

export interface OverlappingSnippetData {
  id: string;
  start: number;
  end: number;
  percentageOverlap: number;
  targetLang: string;
  startPoint: number;
}
