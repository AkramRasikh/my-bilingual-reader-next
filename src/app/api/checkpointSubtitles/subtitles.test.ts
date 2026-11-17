/** @jest-environment node */
import {writeFile, stat} from 'node:fs/promises';
import path from 'node:path';
import {execa} from 'execa';
import {chooseTrack, parseSubtitle, fetchLocalSubtitles} from './subtitles';
jest.mock('execa', () => ({execa: jest.fn()}));
const vtt = 'WEBVTT\n\n00:00:01.000 --> 00:00:03.000\n這是字幕 &amp; 測試\n';
test('prefers original uploaded Chinese tracks and accepts Traditional variants', () => {
  expect(chooseTrack({subtitles: {'zh-Hant': []}, automatic_captions: {'zh-CN': []}}, 'chinese')).toEqual({code: 'zh-Hant', auto: false});
  expect(chooseTrack({automatic_captions: {'zh-TW': []}}, 'chinese')).toEqual({code: 'zh-TW', auto: true});
  expect(chooseTrack({automatic_captions: {'en-zh-CN': []}}, 'english')).toEqual({code: 'en-zh-CN', auto: true});
});
test('parses VTT-only tracks and JSON3 into timestamped cues', () => {
  expect(parseSubtitle(vtt, false)).toEqual([{start: 1, end: 3, text: '這是字幕 & 測試'}]);
  expect(parseSubtitle(JSON.stringify({events: [{tStartMs: 1000, dDurationMs: 2000, segs: [{utf8: 'Hello'}]}]}), true))
    .toEqual([{start: 1, end: 3, text: 'Hello'}]);
});
async function mockDownloads(failEnglish = false) {
  const outputs: string[] = [];
  jest.mocked(execa).mockImplementation(((_program: string, args: string[]) => {
    if (args.includes('--dump-single-json')) return Promise.resolve({stdout: JSON.stringify({subtitles: {'zh-Hant': [], en: []}})});
    const output = args[args.indexOf('-o') + 1];
    outputs.push(output);
    if (failEnglish && output.includes('english.')) return Promise.reject(new Error('429 Too Many Requests'));
    return writeFile(output.replace('%(ext)s', 'zh-Hant.vtt'), vtt).then(() => ({stdout: ''}));
  }) as never);
  return outputs;
}
beforeEach(() => jest.resetAllMocks());
test('manual target-only request never fetches English or media and removes temporary files', async () => {
  const outputs = await mockDownloads();
  const result = await fetchLocalSubtitles('video', 'chinese', false);
  expect(result.target.trackLanguage).toBe('zh-Hant');
  expect(result.english).toBeNull();
  expect(execa).toHaveBeenCalledTimes(2);
  const args = jest.mocked(execa).mock.calls[1][1] as string[];
  expect(args).toContain('--skip-download');
  expect(args).toContain('--write-subs');
  expect(args[args.indexOf('--sub-langs') + 1]).toBe('zh-Hant');
  await expect(stat(path.dirname(outputs[0]))).rejects.toMatchObject({code: 'ENOENT'});
});
test('English failure still returns a usable study-language transcript', async () => {
  await mockDownloads(true);
  const result = await fetchLocalSubtitles('video', 'chinese', true);
  expect(result.target.segments).toHaveLength(1);
  expect(result.english?.status).toBe('unavailable');
});
