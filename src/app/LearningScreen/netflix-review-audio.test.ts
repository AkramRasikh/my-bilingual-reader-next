import {loadNetflixReviewAudio, resolveNetflixReviewAudio, type LocalReviewClip} from './netflix-review-audio';
import type {ContentTranscriptTypes} from '@/app/types/content-types';
import type {WordTypes} from '@/app/types/word-types';

const transcript: ContentTranscriptTypes[] = [128, 131, 142, 145, 149].map(time => ({
  id: String(time), time, targetLang: String(time), baseLang: '',
}));

function clip(start: number, end: number): LocalReviewClip {
  return {
    filename: `${start}-${end}.webm`, episodeStartMs: start, episodeEndMs: end,
    durationMs: end - start, bytes: 10, file: {} as File,
  };
}
const clips = [
  {...clip(128045, 130713), cueRanges: [{time: 128, startMs: 0, endMs: 2668}]},
  {...clip(142184, 148466), cueRanges: [{time: 145, startMs: 2816, endMs: 6282}]},
];

test('uses exported episode bounds for a rounded sentence and switches files for a linked word', () => {
  const sentence = resolveNetflixReviewAudio({kind: 'sentence', item: transcript[0]}, transcript, clips);
  expect(sentence).toEqual({clip: clips[0], start: 0, end: 2.668});
  const word = {contexts: ['131', '145']} as WordTypes;
  const audio = resolveNetflixReviewAudio({kind: 'word', item: word}, transcript, clips);
  expect(audio?.clip).toBe(clips[1]);
  expect(audio?.start).toBeCloseTo(2.816);
  expect(audio?.end).toBeCloseTo(6.282);
  expect(resolveNetflixReviewAudio({kind: 'sentence', item: transcript[1]}, transcript, clips)).toBeUndefined();
});

test('prefers the full snippet range and falls back to its sentence context', () => {
  const snippet = {id: 'snippet', baseLang: '', targetLang: '', time: 144};
  const exact = resolveNetflixReviewAudio({kind: 'snippet', item: snippet}, transcript, clips);
  expect(exact?.start).toBeCloseTo(.316);
  expect(exact?.end).toBeCloseTo(3.316);
  const fallback = resolveNetflixReviewAudio({kind: 'snippet', item: {...snippet, time: 129}}, transcript, clips);
  expect(fallback?.start).toBe(0);
  expect(fallback?.end).toBeCloseTo(2.668);
});

test('loads only the selected episode manifest and validates local clip size', async () => {
  const {file: _, ...metadata} = clips[0];
  const folder = 'NetflixReviewAudio/netflix-81779683/';
  const file = {name: metadata.filename, webkitRelativePath: folder + metadata.filename, size: metadata.bytes} as File;
  const manifest = {
    name: 'manifest.json', webkitRelativePath: folder + 'manifest.json',
    text: async () => JSON.stringify({version: 1, episodeId: 'netflix:81779683', clips: [metadata]}),
  } as File;
  await expect(loadNetflixReviewAudio([file, manifest], 'netflix:81779683')).resolves.toEqual([{...metadata, file}]);
  await expect(loadNetflixReviewAudio([manifest], 'netflix:81779683')).rejects.toThrow('Missing or incomplete clip');
  await expect(loadNetflixReviewAudio([file, manifest], 'netflix:123')).rejects.toThrow('Choose the exported folder');
});

test('uses the exact recorded cue end even when the next transcript timestamp rounds down', () => {
  const rows = [
    {id: 'line', time: 168, targetLang: '歯に衣着せぬ発言で人気沸騰', baseLang: ''},
    {id: 'next', time: 170, targetLang: 'next', baseLang: ''},
  ];
  const audio = {...clip(167877, 172296), cueRanges: [{time: 168, startMs: 210, endMs: 2710}]};
  const word = {contexts: ['line']} as WordTypes;
  expect(resolveNetflixReviewAudio({kind: 'word', item: word}, rows, [audio]))
    .toEqual({clip: audio, start: .210, end: 2.710});
  expect(resolveNetflixReviewAudio({kind: 'sentence', item: rows[1]}, rows, [audio])).toBeUndefined();
  const legacy = clip(167877, 172296);
  expect(resolveNetflixReviewAudio({kind: 'word', item: word}, rows, [legacy])).toBeUndefined();
  expect(resolveNetflixReviewAudio({kind: 'sentence', item: rows[0]}, rows, [legacy])).toBeUndefined();
});
