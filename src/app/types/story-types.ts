export interface StoryTypes {
  targetLang: string;
  baseLang: string;
  notes: string;
  katakana: string;
  chunks: Chunk[];
  wordIds: string[];
  mood: number;
  dialogueOutput: DialogueOutput[];
  audioQuery: AudioQuery;
  audioUrl: string;
  isDialogue?: boolean;
}

export interface AudioQuery {
  accent_phrases: AccentPhrase[];
  speedScale: number;
  pitchScale: number;
  intonationScale: number;
  volumeScale: number;
  prePhonemeLength: number;
  postPhonemeLength: number;
  pauseLength: null;
  pauseLengthScale: number;
  outputSamplingRate: number;
  outputStereo: boolean;
  kana: string;
}

export interface AccentPhrase {
  moras: Mora[];
  accent: number;
  pause_mora: Mora | null;
  is_interrogative: boolean;
}

export interface Mora {
  text: string;
  consonant: null | string;
  consonant_length: number | null;
  vowel: string;
  vowel_length: number;
  pitch: number;
}

export interface Chunk {
  chunk: string;
  reading: string;
}

export interface DialogueOutput {
  chunk: string;
  reading: string;
  start: number;
  end: number;
}
