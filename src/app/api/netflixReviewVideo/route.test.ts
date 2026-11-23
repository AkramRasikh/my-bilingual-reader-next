/** @jest-environment node */
import {
  AbortMultipartUploadCommand,
  CompleteMultipartUploadCommand,
  CreateMultipartUploadCommand,
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  UploadPartCommand,
} from '@aws-sdk/client-s3';
import {POST, PUT} from './route';

const mockSend = jest.fn();
jest.mock('../../shared-apis/s3-instance', () => ({s3: {send: (...args: unknown[]) => mockSend(...args)}}));

const prefix = 'japanese-video/netflix-81779683/';
const base = 'http://localhost:3000/api/netflixReviewVideo?episodeId=netflix%3A81779683&language=japanese';
const recordingId = '0b3c9a52-6c1e-4f7a-9d1e-2f6a8c4b7e10';
const headers = {'x-ll-netflix-video': '1', origin: 'chrome-extension://' + 'a'.repeat(32)};
const details = {startedAt: 1_763_800_000_000, durationMs: 4000, videoOffset: 0.14,
  stretches: [{start: {episodeTime: 60, audioTime: 0.5}, end: {episodeTime: 63.5, audioTime: 4}}]};
const webmHead = Buffer.concat([Buffer.from('1a45dfa3', 'hex'), Buffer.alloc(12)]);
const tail = Buffer.from('tail');

let objects: Map<string, {body: Buffer | string; etag: string}>;
let uploads: Map<string, {key: string; parts: Map<number, Buffer>}>;

function post(body: unknown) {
  return POST(new Request(base, {method: 'POST', headers: {...headers, 'Content-Type': 'application/json'},
    body: JSON.stringify(body)}));
}
function put(uploadId: string, part: number, body: Buffer, extra: Record<string, string> = {}) {
  return PUT(new Request(`${base}&recordingId=${recordingId}&uploadId=${uploadId}&part=${part}`,
    {method: 'PUT', headers: {...headers, 'Content-Type': 'application/octet-stream', ...extra}, body}));
}
const manifest = () => JSON.parse(objects.get(prefix + 'manifest.json')!.body as string);

beforeEach(() => {
  objects = new Map();
  uploads = new Map();
  let revision = 0;
  process.env.CLOUD_FLARE_R2_BUCKET_NAME = 'test';
  mockSend.mockReset();
  mockSend.mockImplementation(async command => {
    const {Key} = command.input;
    const error = (status: number) => Object.assign(new Error(), {$metadata: {httpStatusCode: status}});
    if (command instanceof HeadObjectCommand) {
      const stored = objects.get(Key);
      if (!stored) throw error(404);
      return {ContentLength: stored.body.length};
    }
    if (command instanceof GetObjectCommand) {
      const stored = objects.get(Key);
      if (!stored) throw error(404);
      return {Body: {transformToString: async () => stored.body}, ETag: stored.etag};
    }
    if (command instanceof PutObjectCommand) {
      const stored = objects.get(Key);
      if ((command.input.IfNoneMatch && stored) || (command.input.IfMatch && command.input.IfMatch !== stored?.etag)) throw error(412);
      objects.set(Key, {body: command.input.Body as string, etag: `"rev-${++revision}"`});
      return {};
    }
    if (command instanceof CreateMultipartUploadCommand) {
      expect(command.input.ContentType).toBe('video/webm');
      const id = 'upload-' + (uploads.size + 1);
      uploads.set(id, {key: Key, parts: new Map()});
      return {UploadId: id};
    }
    if (command instanceof UploadPartCommand) {
      const upload = uploads.get(command.input.UploadId!);
      if (!upload || upload.key !== Key) throw error(404);
      upload.parts.set(command.input.PartNumber!, command.input.Body as Buffer);
      return {ETag: `"part-${command.input.PartNumber}"`};
    }
    if (command instanceof CompleteMultipartUploadCommand) {
      const upload = uploads.get(command.input.UploadId!)!;
      const parts = command.input.MultipartUpload!.Parts!.map(part => upload.parts.get(part.PartNumber!)!);
      objects.set(Key, {body: Buffer.concat(parts), etag: `"rev-${++revision}"`});
      uploads.delete(command.input.UploadId!);
      return {};
    }
    if (command instanceof AbortMultipartUploadCommand) {
      uploads.delete(command.input.UploadId!);
      return {};
    }
    throw new Error('Unexpected storage command.');
  });
});

test('uploads a video in parts, publishes it to the episode manifest, and reuses it on a repeat upload', async () => {
  const bytes = webmHead.length + tail.length;
  const started = await (await post({action: 'start', recordingId, bytes, details})).json();
  expect(started).toEqual({exists: false, uploadId: 'upload-1', partBytes: 8 * 1024 * 1024});
  const parts = [];
  for (const [index, body] of [webmHead, tail].entries()) {
    const response = await put(started.uploadId, index + 1, body);
    expect(response.status).toBe(200);
    parts.push({partNumber: index + 1, etag: (await response.json()).etag});
  }
  const done = await (await post({action: 'complete', recordingId, uploadId: started.uploadId, parts, details})).json();
  expect(done).toEqual({bytes, objectKey: prefix + recordingId + '.webm', published: 1});
  expect(objects.get(prefix + recordingId + '.webm')!.body).toEqual(Buffer.concat([webmHead, tail]));
  expect(manifest()).toEqual({version: 1, episodeId: 'netflix:81779683', recordings: [{
    recordingId, filename: recordingId + '.webm', objectKey: prefix + recordingId + '.webm', contentType: 'video/webm',
    bytes, ...details,
  }]});

  const again = await (await post({action: 'start', recordingId, bytes, details})).json();
  expect(again).toEqual({exists: true, bytes, objectKey: prefix + recordingId + '.webm', published: 1});
  expect(uploads.size).toBe(0);
});

test('rejects non-WebM first parts, bad requests, conflicting sizes, and aborts cleanly', async () => {
  const started = await (await post({action: 'start', recordingId, bytes: 20, details})).json();
  expect((await put(started.uploadId, 1, Buffer.from('not webm'))).status).toBe(400);
  expect((await put(started.uploadId, 1, webmHead, {'x-ll-netflix-video': '0'})).status).toBe(403);
  expect((await post({action: 'start', recordingId: 'nope', bytes: 20, details})).status).toBe(400);
  expect((await post({action: 'start', recordingId, bytes: 20, details: {...details, videoOffset: 'x'}})).status).toBe(400);
  expect(await (await post({action: 'abort', recordingId, uploadId: started.uploadId})).json()).toEqual({aborted: true});
  expect(uploads.size).toBe(0);

  objects.set(prefix + recordingId + '.webm', {body: Buffer.alloc(5), etag: '"x"'});
  expect((await post({action: 'start', recordingId, bytes: 20, details})).status).toBe(409);
});
