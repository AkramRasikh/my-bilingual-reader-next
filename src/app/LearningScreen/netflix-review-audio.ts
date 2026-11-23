import type { ContentTranscriptTypes, Snippet } from '@/app/types/content-types';
import type { WordTypes } from '@/app/types/word-types';
import { getSnippetTimeRange } from './learning-screen-review-time-range';

interface CueRange {
  time: number;
  startMs: number;
  endMs: number;
}

interface Clip {
  filename: string;
  episodeStartMs: number;
  episodeEndMs: number;
  durationMs: number;
  bytes: number;
  cueRanges?: CueRange[];
}

export type LocalReviewClip = Clip & { file: File };
export type ReviewClip = LocalReviewClip | (Clip & { url: string });
export interface NetflixReviewRange {
  clip: ReviewClip;
  start: number;
  end: number;
}

export type NetflixReviewItem =
  | { kind: 'sentence'; item: ContentTranscriptTypes }
  | { kind: 'snippet'; item: Snippet }
  | { kind: 'word'; item: WordTypes };

function isClip(value: unknown): value is Clip {
  if (!value || typeof value !== 'object') return false;
  const clip = value as Clip;
  return typeof clip.filename === 'string' && /^\d+-\d+(?:-(?:\d+|[a-f0-9]{64}))?\.webm$/.test(clip.filename) &&
    [clip.episodeStartMs, clip.episodeEndMs, clip.durationMs, clip.bytes].every(Number.isSafeInteger) &&
    clip.episodeStartMs >= 0 && clip.episodeEndMs > clip.episodeStartMs &&
    clip.durationMs > 0 && clip.bytes > 0 &&
    (clip.cueRanges === undefined || (Array.isArray(clip.cueRanges) &&
      clip.cueRanges.every(cue => cue &&
        [cue.time, cue.startMs, cue.endMs].every(Number.isSafeInteger) &&
        cue.time >= 0 && cue.startMs >= 0 && cue.endMs > cue.startMs && cue.endMs <= clip.durationMs)));
}

export async function loadNetflixReviewAudio(files: File[], episodeId: string): Promise<LocalReviewClip[]> {
  const manifests = files.filter(file => file.name === 'manifest.json');
  for (const file of manifests) {
    const manifest = JSON.parse(await file.text());
    if (manifest?.episodeId !== episodeId) continue;
    if (manifest.version !== 1 || !Array.isArray(manifest.clips) ||
        !manifest.clips.length || !manifest.clips.every(isClip)) {
      throw new Error('This episode has an unsupported audio manifest.');
    }
    const folder = file.webkitRelativePath.slice(0, -file.name.length);
    const byPath = new Map(files.map(clip => [clip.webkitRelativePath, clip]));
    return manifest.clips.map((clip: Clip) => {
      const audio = byPath.get(folder + clip.filename);
      if (!audio || audio.size !== clip.bytes) throw new Error(`Missing or incomplete clip: ${clip.filename}`);
      return {...clip, file: audio};
    });
  }
  throw new Error('Choose the exported folder for this Netflix episode.');
}

export async function loadCloudflareReviewAudio(
  language: string,
  episodeId: string,
  assets: string,
  signal?: AbortSignal,
): Promise<ReviewClip[]> {
  const id = /^netflix:(\d{1,20})$/.exec(episodeId)?.[1];
  if (!id || !['japanese', 'chinese', 'arabic', 'french'].includes(language)) return [];
  const query = new URLSearchParams({language, episodeId});
  const response = await fetch(`/api/netflixReviewAudioManifest?${query}`, {cache: 'no-store', signal});
  if (response.status === 404) return [];
  if (!response.ok) throw new Error('Cloudflare review audio is temporarily unavailable.');
  const manifest = await response.json();
  if (manifest?.version !== 1 || manifest.episodeId !== episodeId ||
      !Array.isArray(manifest.clips) || !manifest.clips.every(isClip)) {
    throw new Error('This episode has an unsupported Cloudflare audio manifest.');
  }
  const prefix = `${language}-audio/netflix-${id}/`;
  return manifest.clips.map((clip: Clip & {objectKey?: string}) => {
    if (clip.objectKey !== prefix + clip.filename) {
      throw new Error('The Cloudflare manifest contains a clip outside this episode.');
    }
    return {...clip, url: new URL(clip.objectKey, assets.replace(/\/?$/, '/')).href};
  });
}

export function resolveNetflixReviewAudio(
  target: NetflixReviewItem,
  transcript: ContentTranscriptTypes[],
  clips: ReviewClip[],
): NetflixReviewRange | undefined {
  function sentenceAudio(sentence: ContentTranscriptTypes) {
    for (const clip of clips) {
      const cue = clip.cueRanges?.find(range => range.time === sentence.time);
      if (cue) return {clip, start: cue.startMs / 1000, end: cue.endMs / 1000};
    }
  }

  if (target.kind === 'sentence') return sentenceAudio(target.item);
  if (target.kind === 'word') {
    for (const id of target.item.contexts || []) {
      const sentence = transcript.find(row => row.id === id);
      const audio = sentence && sentenceAudio(sentence);
      if (audio) return audio;
    }
    return;
  }
  const {startTime, endTime} = getSnippetTimeRange(target.item);
  const startMs = Math.max(0, startTime) * 1000;
  const endMs = endTime * 1000;
  const clip = clips.find(clip => clip.episodeStartMs <= startMs && clip.episodeEndMs >= endMs);
  if (clip && endMs > startMs) {
    const scale = clip.durationMs / (clip.episodeEndMs - clip.episodeStartMs) / 1000;
    return {clip, start: (startMs - clip.episodeStartMs) * scale, end: (endMs - clip.episodeStartMs) * scale};
  }
  const context = transcript.reduce<ContentTranscriptTypes | undefined>((closest, row) =>
    row.time <= target.item.time && (!closest || row.time > closest.time) ? row : closest, undefined);
  return context && sentenceAudio(context);
}
