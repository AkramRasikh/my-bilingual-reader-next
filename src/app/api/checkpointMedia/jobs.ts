import {mkdtemp, stat, unlink, rm} from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import {uploadCheckpointFile} from './upload';
import {randomUUID} from 'node:crypto';
import {downloadYoutubeAudio} from '../getYoutubeVideo/downloadYoutubeAudio';
import {downloadYoutubeVideo} from '../getYoutubeVideo/downloadYoutubeVideo';
import {listYoutubeFormats} from '../getYoutubeVideo/listYoutubeFormats';
import {isYoutubeFormatId, YoutubeFormat} from '../getYoutubeVideo/youtubeFormats';

export type MediaJob = {
  id: string; contentId: string; language: string; title?: string;
  status: 'downloading' | 'select-formats' | 'downloaded' | 'uploading' | 'uploaded' | 'error';
  directory: string; audioPath?: string; videoPath?: string; audioKey?: string; videoKey?: string;
  formats: YoutubeFormat[]; error?: string; formatListError?: string;
};
// Local Next server only: retain jobs across development module reloads.
const state = globalThis as typeof globalThis & {checkpointMediaJobs?: Map<string, MediaJob>};
const jobs = state.checkpointMediaJobs ??= new Map<string, MediaJob>();
export const getMediaJob = (id: string) => jobs.get(id);
const readable = async (file: string) => {
  try {return (await stat(file)).size > 0;} catch {return false;}
};
const message = (error: unknown) => (error instanceof Error ? error.message : String(error)).slice(-800);

export async function startMediaJob(contentId: string, language: string, title: string) {
  const existing = [...jobs.values()].find(job => job.contentId === contentId && job.language === language);
  if (existing && !['error', 'downloaded'].includes(existing.status)) return existing;
  if ([...jobs.values()].filter(job => ['downloading', 'uploading'].includes(job.status)).length >= 2) {
    throw new Error('Two downloads are already running. Wait for one to finish.');
  }
  if (existing?.directory) {
    existing.title = title;
    existing.status = 'downloading';
    void runMediaJob(existing);
    return existing;
  }
  const job: MediaJob = {id: randomUUID(), contentId, language, title, status: 'downloading', directory: '', formats: []};
  jobs.set(job.id, job);
  try {job.directory = await mkdtemp(path.join(os.tmpdir(), 'youtube-checkpoints-'));}
  catch (error) {job.status = 'error'; job.error = message(error); throw error;}
  void runMediaJob(job);
  return job;
}
export function retryMediaJob(job: MediaJob, videoFormatId: unknown, audioFormatId: unknown) {
  if (job.status !== 'select-formats') throw new Error('This download is not waiting for format selection.');
  if (!isYoutubeFormatId(videoFormatId) || !isYoutubeFormatId(audioFormatId) ||
      !job.formats.some(format => format.id === videoFormatId && format.kind !== 'audio') ||
      !job.formats.some(format => format.id === audioFormatId && format.kind !== 'video')) {
    throw new Error('Choose an available video format and audio format.');
  }
  job.status = 'downloading';
  void runMediaJob(job, videoFormatId, audioFormatId);
}

export async function runMediaJob(job: MediaJob, videoFormatId?: string, audioFormatId?: string) {
  try {
    delete job.error; delete job.formatListError;
    const url = `https://www.youtube.com/watch?v=${job.contentId}`;
    const errors: string[] = [];
    const audioPath = path.join(job.directory, 'audio.mp3');
    const videoPath = path.join(job.directory, 'video.mp4');
    if (!job.audioKey && (!job.audioPath || !await readable(job.audioPath))) {
      try {
        await downloadYoutubeAudio({url, outTemplate: path.join(job.directory, 'audio.%(ext)s'), audioFormatId});
        if (!await readable(audioPath)) throw new Error('No MP3 file was produced.');
        job.audioPath = audioPath;
      } catch (error) {errors.push(`Audio: ${message(error)}`);}
    }
    if (!job.videoKey && (!job.videoPath || !await readable(job.videoPath))) {
      try {
        const success = await downloadYoutubeVideo({url, outTemplate: path.join(job.directory, 'video.%(ext)s'), videoFormatId, audioFormatId});
        if (!success || !await readable(videoPath)) throw new Error('Default formats were unavailable or no MP4 file was produced.');
        job.videoPath = videoPath;
      } catch (error) {errors.push(`Video: ${message(error)}`);}
    }
    if (!errors.length) {
      job.status = 'uploading'; job.formats = [];
      if (!job.title?.trim()) throw new Error('Restart this media job to load its content title.');
      // The reader derives media URLs from language and the database title.
      // Record each successful R2 upload before deleting its local source file.
      if (!job.audioKey) {
        const key = `${job.language}-audio/${job.title}.mp3`;
        await uploadCheckpointFile(job.audioPath!, key, 'audio/mpeg', job.contentId);
        job.audioKey = key;
      }
      if (job.audioPath) {await unlink(job.audioPath).catch(error => {if (error.code !== 'ENOENT') throw error;}); delete job.audioPath;}
      if (!job.videoKey) {
        const key = `${job.language}-video/${job.title}.mp4`;
        await uploadCheckpointFile(job.videoPath!, key, 'video/mp4', job.contentId);
        job.videoKey = key;
      }
      if (job.videoPath) {await unlink(job.videoPath).catch(error => {if (error.code !== 'ENOENT') throw error;}); delete job.videoPath;}
      await rm(job.directory, {recursive: true, force: true});
      job.status = 'uploaded';
      return;
    }
    job.error = errors.join('\n');
    try {job.formats = await listYoutubeFormats(url);}
    catch (error) {job.formats = []; job.formatListError = message(error);}
    job.status = job.formats.length ? 'select-formats' : 'error';
  } catch (error) {job.status = 'error'; job.error = message(error);}
  // Failed uploads retain their source files. Successful uploads are tracked
  // separately so retries do not re-download or re-upload completed media.
}
