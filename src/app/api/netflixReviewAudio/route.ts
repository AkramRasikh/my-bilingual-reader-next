import {GetObjectCommand, HeadObjectCommand, PutObjectCommand} from '@aws-sdk/client-s3';
import {s3} from '../../shared-apis/s3-instance';

export const runtime = 'nodejs';
const maxClipBytes = 8 * 1024 * 1024;
const maxManifestBytes = 2 * 1024 * 1024;
const digestPattern = /^[a-f0-9]{64}$/;

interface ClipPlan {
  episodeStartMs: number;
  episodeEndMs: number;
  sourceSha256: string;
}
interface Clip extends ClipPlan {
  clipId: string;
  filename: string;
  objectKey: string;
  durationMs: number;
  bytes: number;
  cueRanges: {time: number; startMs: number; endMs: number}[];
}
interface Manifest {
  version: 1;
  episodeId: string;
  clips: Clip[];
}
class RequestError extends Error {
  constructor(message: string, readonly status = 400) {super(message);}
}

function setup(request: Request) {
  const url = new URL(request.url);
  const origin = request.headers.get('origin');
  if (!['localhost', '127.0.0.1'].includes(url.hostname) ||
      (origin && !/^chrome-extension:\/\/[a-p]{32}$/.test(origin)) ||
      request.headers.get('x-ll-netflix-audio') !== '1') {
    throw new RequestError('Use the extension with your local Next.js reader.', 403);
  }
  const episodeId = url.searchParams.get('episodeId') || '';
  const language = url.searchParams.get('language') || '';
  const id = /^netflix:(\d{1,20})$/.exec(episodeId)?.[1];
  if (!id || !['japanese', 'chinese', 'arabic', 'french'].includes(language)) {
    throw new RequestError('Invalid episode or study language.');
  }
  const bucket = process.env.CLOUD_FLARE_R2_BUCKET_NAME || process.env.NEXT_PUBLIC_CLOUD_FLARE_R2_BUCKET_NAME;
  if (!bucket) throw new RequestError('Cloudflare R2 is not configured on the local reader.', 503);
  return {url, episodeId, bucket, prefix: `${language}-audio/netflix-${id}/`};
}
type Scope = ReturnType<typeof setup>;

function isPlan(value: unknown): value is ClipPlan {
  if (!value || typeof value !== 'object') return false;
  const {episodeStartMs, episodeEndMs, sourceSha256} = value as ClipPlan;
  return Number.isSafeInteger(episodeStartMs) && episodeStartMs >= 0 &&
    Number.isSafeInteger(episodeEndMs) && episodeEndMs > episodeStartMs &&
    typeof sourceSha256 === 'string' && digestPattern.test(sourceSha256);
}
function clipName(clip: ClipPlan) {
  return [clip.episodeStartMs, clip.episodeEndMs].map(time => String(time).padStart(9, '0')).join('-') +
    '-' + clip.sourceSha256;
}
function sameRange(a: ClipPlan, b: ClipPlan) {
  return a.episodeStartMs === b.episodeStartMs && a.episodeEndMs === b.episodeEndMs;
}
function httpStatus(error: unknown) {
  return (error as {$metadata?: {httpStatusCode?: number}})?.$metadata?.httpStatusCode;
}
function fail(error: unknown) {
  if (error instanceof RequestError) return Response.json({error: error.message}, {status: error.status});
  console.error('Netflix review audio storage failed:', error instanceof Error ? error.name : 'Unknown error');
  return Response.json({error: 'Could not update Cloudflare R2. Check the reader configuration and retry.'}, {status: 502});
}
async function readManifest(scope: Scope): Promise<{manifest: Manifest; etag?: string}> {
  try {
    const object = await s3.send(new GetObjectCommand({Bucket: scope.bucket, Key: scope.prefix + 'manifest.json'}));
    const manifest = JSON.parse(await object.Body!.transformToString()) as Manifest;
    if (manifest.version !== 1 || manifest.episodeId !== scope.episodeId || !Array.isArray(manifest.clips) || !object.ETag) {
      throw new RequestError('The existing R2 manifest has an unsupported format.', 409);
    }
    return {manifest, etag: object.ETag};
  } catch (error) {
    if (httpStatus(error) !== 404) throw error;
    return {manifest: {version: 1, episodeId: scope.episodeId, clips: []}};
  }
}
async function existingBytes(scope: Scope, clip: ClipPlan) {
  try {
    const object = await s3.send(new HeadObjectCommand({Bucket: scope.bucket, Key: scope.prefix + clipName(clip) + '.webm'}));
    if (object.Metadata?.['source-sha256'] !== clip.sourceSha256 || !object.ContentLength) {
      throw new RequestError('An existing clip conflicts with this upload.', 409);
    }
    return object.ContentLength;
  } catch (error) {
    if (httpStatus(error) !== 404) throw error;
    return 0;
  }
}
async function readBody(request: Request, limit: number) {
  const reader = request.body?.getReader();
  if (!reader) throw new RequestError('Missing request body.');
  const chunks = [];
  let size = 0;
  try {
    while (true) {
      const {value, done} = await reader.read();
      if (done) return Buffer.concat(chunks, size);
      size += value.byteLength;
      if (size > limit) {
        await reader.cancel();
        throw new RequestError('Upload exceeds the allowed size.', 413);
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
}

export async function PUT(request: Request) {
  try {
    const scope = setup(request);
    const clip = {
      episodeStartMs: Number(scope.url.searchParams.get('start')),
      episodeEndMs: Number(scope.url.searchParams.get('end')),
      sourceSha256: scope.url.searchParams.get('hash') || '',
    };
    if (!scope.url.searchParams.has('start') || !isPlan(clip) ||
        request.headers.get('content-type') !== 'audio/webm') throw new RequestError('Invalid WebM clip.');
    const current = await existingBytes(scope, clip);
    if (current) return Response.json({bytes: current, uploaded: false});
    const bytes = await readBody(request, maxClipBytes);
    if (bytes.length < 4 || bytes.readUInt32BE(0) !== 0x1a45dfa3) throw new RequestError('Expected a WebM file.');
    try {
      await s3.send(new PutObjectCommand({
        Bucket: scope.bucket, Key: scope.prefix + clipName(clip) + '.webm',
        ContentType: 'audio/webm', Body: bytes, IfNoneMatch: '*',
        Metadata: {'source-sha256': clip.sourceSha256}
      }));
      return Response.json({bytes: bytes.length, uploaded: true});
    } catch (error) {
      if (httpStatus(error) !== 412) throw error;
      const stored = await existingBytes(scope, clip);
      if (!stored) throw error;
      return Response.json({bytes: stored, uploaded: false});
    }
  } catch (error) {
    return fail(error);
  }
}

export async function POST(request: Request) {
  try {
    const scope = setup(request);
    if (!request.headers.get('content-type')?.startsWith('application/json')) throw new RequestError('Expected JSON.', 415);
    let payload;
    try {payload = JSON.parse((await readBody(request, maxManifestBytes)).toString());}
    catch (error) {if (error instanceof RequestError) throw error; throw new RequestError('Invalid JSON.');}
    const {action, clips} = payload || {};
    if (!Array.isArray(clips) || !clips.length || clips.length > 500 || !clips.every(isPlan)) {
      throw new RequestError('Expected a list of up to 500 valid clips.');
    }
    if (action === 'check') {
      const {manifest} = await readManifest(scope);
      const plans = await Promise.all((clips as ClipPlan[]).map(async clip => {
        const alternate = manifest.clips.some(old => sameRange(old, clip) && old.sourceSha256 !== clip.sourceSha256) &&
          !manifest.clips.some(old => clipName(old) === clipName(clip));
        const bytes = alternate ? 0 : await existingBytes(scope, clip);
        const saved = manifest.clips.find(old => clipName(old) === clipName(clip));
        return {clipId: clipName(clip), alternate, bytes, durationMs: saved?.durationMs};
      }));
      return Response.json({plans, published: manifest.clips.length});
    }
    if (action !== 'publish') throw new RequestError('Unknown upload action.');
    const updated = await Promise.all((clips as Clip[]).map(async clip => {
      const {durationMs, cueRanges} = clip;
      if (!Number.isSafeInteger(durationMs) || durationMs <= 0 || !Array.isArray(cueRanges) ||
          !cueRanges.every(cue => cue && [cue.time, cue.startMs, cue.endMs].every(Number.isSafeInteger) &&
            cue.time >= 0 && cue.startMs >= 0 && cue.endMs > cue.startMs && cue.endMs <= durationMs)) {
        throw new RequestError('Invalid clip duration or cue ranges.');
      }
      const bytes = await existingBytes(scope, clip);
      if (!bytes) throw new RequestError('A clip is missing in R2. Retry the upload.', 409);
      const clipId = clipName(clip), filename = clipId + '.webm';
      return {clipId, filename, objectKey: scope.prefix + filename, bytes, durationMs,
        episodeStartMs: clip.episodeStartMs, episodeEndMs: clip.episodeEndMs,
        sourceSha256: clip.sourceSha256, cueRanges: cueRanges.map(({time, startMs, endMs}) => ({time, startMs, endMs}))};
    }));
    for (let attempt = 0; attempt < 4; attempt++) {
      const {manifest, etag} = await readManifest(scope);
      const byId = new Map(manifest.clips.map(clip => [clip.clipId, clip]));
      for (const clip of updated) {
        if (!byId.has(clip.clipId) && [...byId.values()].some(old => sameRange(old, clip))) continue;
        byId.set(clip.clipId, clip);
      }
      const merged = [...byId.values()];
      if (JSON.stringify(merged) === JSON.stringify(manifest.clips)) return Response.json({published: merged.length});
      try {
        await s3.send(new PutObjectCommand({
          Bucket: scope.bucket, Key: scope.prefix + 'manifest.json', ContentType: 'application/json',
          Body: JSON.stringify({...manifest, clips: merged}), CacheControl: 'no-cache',
          ...(etag ? {IfMatch: etag} : {IfNoneMatch: '*'})
        }));
        return Response.json({published: merged.length});
      } catch (error) {
        if (httpStatus(error) !== 412) throw error;
      }
    }
    throw new RequestError('The episode was updated by another upload. Retry to merge your clips.', 409);
  } catch (error) {
    return fail(error);
  }
}
