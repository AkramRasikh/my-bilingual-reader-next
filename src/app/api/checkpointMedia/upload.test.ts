/** @jest-environment node */
import {mkdtemp, writeFile, rm, stat} from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import {PutObjectCommand} from '@aws-sdk/client-s3';
import {s3} from '../../shared-apis/s3-instance';
import {uploadCheckpointFile} from './upload';
jest.mock('../../shared-apis/s3-instance', () => ({s3: {send: jest.fn()}}));
let directory: string, file: string;
const oldBucket = process.env.CLOUD_FLARE_R2_BUCKET_NAME;
beforeEach(async () => {
  jest.clearAllMocks();
  process.env.CLOUD_FLARE_R2_BUCKET_NAME = 'test-bucket';
  directory = await mkdtemp(path.join(os.tmpdir(), 'r2-checkpoint-test-'));
  file = path.join(directory, 'audio.mp3');
  await writeFile(file, 'test audio');
});
afterEach(async () => {
  await rm(directory, {recursive: true, force: true});
  if (oldBucket === undefined) delete process.env.CLOUD_FLARE_R2_BUCKET_NAME;
  else process.env.CLOUD_FLARE_R2_BUCKET_NAME = oldBucket;
});
test('streams the correct object to R2 with its size, MIME type and YouTube ID', async () => {
  jest.mocked(s3.send).mockResolvedValueOnce({$metadata: {httpStatusCode: 200}} as never);
  await uploadCheckpointFile(file, 'chinese-audio/Monster.mp3', 'audio/mpeg', 'JyJGBINzLZc');
  const command = jest.mocked(s3.send).mock.calls[0][0];
  if (!(command instanceof PutObjectCommand)) throw new Error('Expected PutObjectCommand');
  expect(command.input).toMatchObject({Bucket: 'test-bucket', Key: 'chinese-audio/Monster.mp3',
    ContentLength: 10, ContentType: 'audio/mpeg', Metadata: {'youtube-id': 'JyJGBINzLZc'}});
  expect((command.input.Body as {destroyed: boolean}).destroyed).toBe(true);
});
test('rejects an unconfirmed upload and leaves the local file available', async () => {
  jest.mocked(s3.send).mockResolvedValueOnce({$metadata: {httpStatusCode: 503}} as never);
  await expect(uploadCheckpointFile(file, 'key', 'audio/mpeg', 'video')).rejects.toThrow('did not confirm');
  expect((await stat(file)).size).toBe(10);
});
test('rejects an empty file before sending it to Cloudflare', async () => {
  await writeFile(file, '');
  await expect(uploadCheckpointFile(file, 'key', 'audio/mpeg', 'video')).rejects.toThrow('empty');
  expect(s3.send).not.toHaveBeenCalled();
});
