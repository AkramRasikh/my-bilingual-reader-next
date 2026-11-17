/** @jest-environment node */
import {mkdtemp, writeFile, rm, stat} from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {runMediaJob, retryMediaJob, MediaJob} from './jobs';
import {downloadYoutubeAudio} from '../getYoutubeVideo/downloadYoutubeAudio';
import {downloadYoutubeVideo} from '../getYoutubeVideo/downloadYoutubeVideo';
import {uploadCheckpointFile} from './upload';
import {listYoutubeFormats} from '../getYoutubeVideo/listYoutubeFormats';
jest.mock('../getYoutubeVideo/downloadYoutubeAudio', () => ({downloadYoutubeAudio: jest.fn()}));
jest.mock('../getYoutubeVideo/downloadYoutubeVideo', () => ({downloadYoutubeVideo: jest.fn()}));
jest.mock('./upload', () => ({uploadCheckpointFile: jest.fn()}));
jest.mock('../getYoutubeVideo/listYoutubeFormats', () => ({listYoutubeFormats: jest.fn()}));
let job: MediaJob;
beforeEach(async () => {
  jest.resetAllMocks();
  job = {id: 'job', contentId: 'JyJGBINzLZc', language: 'chinese', title: 'Monster', status: 'downloading', formats: [],
    directory: await mkdtemp(path.join(os.tmpdir(), 'checkpoint-test-'))};
  jest.mocked(uploadCheckpointFile).mockImplementation(async file => {expect((await stat(file)).size).toBeGreaterThan(0);});
  jest.mocked(downloadYoutubeAudio).mockImplementation(async ({outTemplate}) => {
    await writeFile(outTemplate.replace('%(ext)s', 'mp3'), 'audio');
  });
  jest.mocked(downloadYoutubeVideo).mockImplementation(async ({outTemplate}) => {
    await writeFile(outTemplate.replace('%(ext)s', 'mp4'), 'video'); return true;
  });
});
afterEach(async () => {await rm(job.directory, {recursive: true, force: true});});
test('downloads and uploads MP3 and MP4, deleting local files only after upload success', async () => {
  await runMediaJob(job);
  expect(job.status).toBe('uploaded');
  expect(downloadYoutubeAudio).toHaveBeenCalledWith(expect.objectContaining({url: 'https://www.youtube.com/watch?v=JyJGBINzLZc'}));
  expect(job.audioKey).toBe('chinese-audio/Monster.mp3');
  expect(job.videoKey).toBe('chinese-video/Monster.mp4');
  expect(uploadCheckpointFile).toHaveBeenCalledWith(expect.any(String), job.audioKey, 'audio/mpeg', job.contentId);
  expect(uploadCheckpointFile).toHaveBeenCalledWith(expect.any(String), job.videoKey, 'video/mp4', job.contentId);
  await expect(stat(job.directory)).rejects.toMatchObject({code: 'ENOENT'});
  expect(listYoutubeFormats).not.toHaveBeenCalled();
});
test('offers available formats on default video failure and retains the successful MP3', async () => {
  jest.mocked(downloadYoutubeVideo).mockResolvedValueOnce(false);
  jest.mocked(listYoutubeFormats).mockResolvedValue([{id: '18', kind: 'both', ext: 'mp4', resolution: '360p',
    fps: 30, filesize: null, vcodec: 'avc1', acodec: 'aac', note: null}]);
  await runMediaJob(job);
  expect(job.status).toBe('select-formats');
  expect((await stat(job.audioPath!)).size).toBeGreaterThan(0);
  expect(() => retryMediaJob(job, 'bad-format', '18')).toThrow('Choose an available');
  await runMediaJob(job, '18', '18');
  expect(job.status).toBe('uploaded');
  expect(downloadYoutubeAudio).toHaveBeenCalledTimes(1);
  expect(downloadYoutubeVideo).toHaveBeenLastCalledWith(expect.objectContaining({videoFormatId: '18', audioFormatId: '18'}));
});
test('reports listing errors without deleting partially downloaded media', async () => {
  jest.mocked(downloadYoutubeVideo).mockResolvedValue(false);
  jest.mocked(listYoutubeFormats).mockRejectedValue(new Error('No formats available'));
  await runMediaJob(job);
  expect(job.status).toBe('error');
  expect(job.formatListError).toBe('No formats available');
  expect((await stat(job.audioPath!)).size).toBeGreaterThan(0);
});


test('retains both local files if the first R2 upload fails', async () => {
  jest.mocked(uploadCheckpointFile).mockRejectedValueOnce(new Error('R2 unavailable'));
  await runMediaJob(job);
  expect(job.status).toBe('error');
  expect(job.error).toContain('R2 unavailable');
  expect(job.audioKey).toBeUndefined();
  expect((await stat(job.audioPath!)).size).toBeGreaterThan(0);
  expect((await stat(job.videoPath!)).size).toBeGreaterThan(0);
  expect(listYoutubeFormats).not.toHaveBeenCalled();
});

test('retries a failed video upload without redownloading or reuploading the successful MP3', async () => {
  jest.mocked(uploadCheckpointFile).mockResolvedValueOnce(undefined).mockRejectedValueOnce(new Error('Video upload failed'));
  await runMediaJob(job);
  expect(job.status).toBe('error');
  expect(job.audioKey).toBe('chinese-audio/Monster.mp3');
  await expect(stat(path.join(job.directory, 'audio.mp3'))).rejects.toMatchObject({code: 'ENOENT'});
  expect((await stat(job.videoPath!)).size).toBeGreaterThan(0);
  await runMediaJob(job);
  expect(job.status).toBe('uploaded');
  expect(downloadYoutubeAudio).toHaveBeenCalledTimes(1);
  expect(downloadYoutubeVideo).toHaveBeenCalledTimes(1);
  expect(uploadCheckpointFile).toHaveBeenCalledTimes(3);
  expect(uploadCheckpointFile).toHaveBeenLastCalledWith(expect.any(String), 'chinese-video/Monster.mp4', 'video/mp4', job.contentId);
  await expect(stat(job.directory)).rejects.toMatchObject({code: 'ENOENT'});
});
