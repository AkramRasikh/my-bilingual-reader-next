/** @jest-environment node */
import {GetObjectCommand, HeadObjectCommand, PutObjectCommand} from '@aws-sdk/client-s3';
import {POST, PUT} from './route';

const mockSend = jest.fn();
jest.mock('../../shared-apis/s3-instance', () => ({s3: {send: (...args: unknown[]) => mockSend(...args)}}));

const prefix = 'japanese-audio/netflix-81779683/';
const base = 'http://localhost:3000/api/netflixReviewAudio?episodeId=netflix%3A81779683&language=japanese';
const first = {episodeStartMs: 12000, episodeEndMs: 15000, sourceSha256: 'a'.repeat(64)};
const next = {episodeStartMs: 19000, episodeEndMs: 21000, sourceSha256: 'b'.repeat(64)};
const webm = Buffer.from('1a45dfa300', 'hex');
const headers = {'x-ll-netflix-audio': '1', origin: 'chrome-extension://' + 'a'.repeat(32)};
function post(action: string, clips: unknown[]) {
  return POST(new Request(base, {method: 'POST', headers: {...headers, 'Content-Type': 'application/json'},
    body: JSON.stringify({action, clips})}));
}
function put(clip: typeof first) {
  return PUT(new Request(`${base}&start=${clip.episodeStartMs}&end=${clip.episodeEndMs}&hash=${clip.sourceSha256}`,
    {method: 'PUT', headers: {...headers, 'Content-Type': 'audio/webm'}, body: webm}));
}
const metadata = (clip: typeof first) => ({...clip, durationMs: clip.episodeEndMs - clip.episodeStartMs, cueRanges: []});

beforeEach(() => {
  const objects = new Map<string, {body: unknown; size: number; hash?: string; etag: string}>();
  let revision = 0;
  process.env.CLOUD_FLARE_R2_BUCKET_NAME = 'test';
  mockSend.mockReset();
  mockSend.mockImplementation(async command => {
    const {Key} = command.input;
    const stored = objects.get(Key);
    const error = (status: number) => Object.assign(new Error(), {$metadata: {httpStatusCode: status}});
    if (command instanceof HeadObjectCommand) {
      if (!stored) throw error(404);
      return {ContentLength: stored.size, Metadata: {'source-sha256': stored.hash}};
    }
    if (command instanceof GetObjectCommand) {
      if (!stored) throw error(404);
      return {Body: {transformToString: async () => stored.body}, ETag: stored.etag};
    }
    if (!(command instanceof PutObjectCommand)) throw new Error('Unexpected storage command.');
    if ((command.input.IfNoneMatch && stored) || (command.input.IfMatch && command.input.IfMatch !== stored?.etag)) {
      throw error(412);
    }
    const {Body, Metadata} = command.input;
    objects.set(Key, {body: Body, size: (Body as Buffer | string).length,
      hash: Metadata?.['source-sha256'], etag: `"rev-${++revision}"`});
    return {};
  });
});

test('uploads new clips, discovers uploaded files before publishing, and appends only new ranges', async () => {
  expect((await (await post('check', [first])).json()).plans[0].bytes).toBe(0);
  expect(await (await put(first)).json()).toEqual({bytes: webm.length, uploaded: true});
  const recovered = await (await post('check', [first])).json();
  expect(recovered).toMatchObject({published: 0, plans: [{bytes: webm.length}]});
  expect(await (await post('publish', [metadata(first)])).json()).toEqual({published: 1});
  expect(await (await put(first)).json()).toEqual({bytes: webm.length, uploaded: false});
  const plan = await (await post('check', [first, next, {...first, sourceSha256: 'c'.repeat(64)}])).json();
  expect(plan.plans).toMatchObject([{bytes: webm.length}, {bytes: 0}, {alternate: true}]);
  expect(await (await put(next)).json()).toEqual({bytes: webm.length, uploaded: true});
  expect(await (await post('publish', [metadata(first), metadata(next)])).json()).toEqual({published: 2});

  const writes = mockSend.mock.calls.map(([command]) => command).filter(command => command instanceof PutObjectCommand);
  const clipWrites = writes.filter(command => command.input.Key.endsWith('.webm'));
  expect(clipWrites).toHaveLength(2);
  expect(clipWrites[0].input.Key).toBe(prefix + '000012000-000015000-' + first.sourceSha256 + '.webm');
  const latest = JSON.parse(writes.at(-1).input.Body);
  expect(latest.clips).toHaveLength(2);
  expect(latest.clips[0].objectKey).toBe(clipWrites[0].input.Key);
});

test('rejects a website origin before touching R2', async () => {
  const response = await POST(new Request(base, {method: 'POST', headers: {...headers, origin: 'https://example.org'}}));
  expect(response.status).toBe(403);
  expect(mockSend).not.toHaveBeenCalled();
});
