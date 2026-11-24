/** @jest-environment node */
import {
  AbortMultipartUploadCommand,
  DeleteObjectsCommand,
  ListMultipartUploadsCommand,
  ListObjectsV2Command,
} from '@aws-sdk/client-s3';
import {POST} from './route';

const mockSend = jest.fn();
jest.mock('../../shared-apis/s3-instance', () => ({s3: {send: (...args: unknown[]) => mockSend(...args)}}));

let objects: Set<string>;
let uploads: {Key: string; UploadId: string}[];
let deleteOrder: string[][];

function post(body: unknown) {
  return POST(new Request('http://localhost:3000/api/deleteNetflixMedia', {
    method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(body),
  }));
}

beforeEach(() => {
  process.env.CLOUD_FLARE_R2_BUCKET_NAME = 'test';
  objects = new Set([
    'japanese-audio/netflix-81779683/manifest.json',
    'japanese-audio/netflix-81779683/000000000-000004000-abc.webm',
    'japanese-video/netflix-81779683/manifest.json',
    'japanese-video/netflix-81779683/0b3c9a52-6c1e-4f7a-9d1e-2f6a8c4b7e10.webm',
    'japanese-audio/netflix-817796830/other-episode.webm',
    'japanese-video/some-youtube-title.mp4',
  ]);
  uploads = [{Key: 'japanese-video/netflix-81779683/pending.webm', UploadId: 'u1'}];
  deleteOrder = [];
  mockSend.mockReset();
  mockSend.mockImplementation(async command => {
    const input = command.input;
    if (command instanceof ListObjectsV2Command) {
      return {Contents: [...objects].filter(key => key.startsWith(input.Prefix)).map(Key => ({Key}))};
    }
    if (command instanceof DeleteObjectsCommand) {
      const keys = input.Delete.Objects.map((object: {Key: string}) => object.Key);
      deleteOrder.push(keys);
      keys.forEach((key: string) => objects.delete(key));
      return {};
    }
    if (command instanceof ListMultipartUploadsCommand) {
      return {Uploads: uploads.filter(upload => upload.Key.startsWith(input.Prefix))};
    }
    if (command instanceof AbortMultipartUploadCommand) {
      uploads = uploads.filter(upload => upload.UploadId !== input.UploadId);
      return {};
    }
    throw new Error('Unexpected command');
  });
});

test('deletes only this episode’s audio and video, manifests first', async () => {
  const response = await post({episodeId: 'netflix:81779683', language: 'Japanese'});
  expect(response.status).toBe(200);
  expect(await response.json()).toEqual({deleted: 4, aborted: 1});
  expect([...objects]).toEqual([
    'japanese-audio/netflix-817796830/other-episode.webm',
    'japanese-video/some-youtube-title.mp4',
  ]);
  expect(uploads).toEqual([]);
  expect(deleteOrder[0]).toEqual(['japanese-audio/netflix-81779683/manifest.json']);
});

test('is idempotent when nothing is stored', async () => {
  objects.clear();
  uploads = [];
  const response = await post({episodeId: 'netflix:81779683', language: 'japanese'});
  expect(await response.json()).toEqual({deleted: 0, aborted: 0});
});

test.each([
  [{episodeId: 'youtube-id', language: 'japanese'}],
  [{episodeId: 'netflix:81779683', language: 'klingon'}],
  [{episodeId: 'netflix:../../x', language: 'japanese'}],
])('rejects invalid input %j', async body => {
  expect((await post(body)).status).toBe(400);
  expect(mockSend).not.toHaveBeenCalled();
});

test('reports an R2 delete failure', async () => {
  mockSend.mockImplementation(async command => {
    if (command instanceof DeleteObjectsCommand) return {Errors: [{Key: 'x'}]};
    if (command instanceof ListObjectsV2Command) return {Contents: [{Key: command.input.Prefix + 'manifest.json'}]};
    return {};
  });
  expect((await post({episodeId: 'netflix:81779683', language: 'japanese'})).status).toBe(502);
});
