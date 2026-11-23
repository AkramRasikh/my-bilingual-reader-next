import {
  AbortMultipartUploadCommand,
  CompleteMultipartUploadCommand,
  CreateMultipartUploadCommand,
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  UploadPartCommand,
} from '@aws-sdk/client-s3';
import {s3} from '../../shared-apis/s3-instance';

// Whole Netflix tab-recording videos from the extension, for the Android app to stream from R2.
// Files are too large for one buffered request, so the extension sends fixed-size parts that are
// forwarded to an R2 multipart upload. R2 requires every part but the last to be the same size.
export const runtime = 'nodejs';
const partBytes = 8 * 1024 * 1024;
const maxVideoBytes = 4 * 1024 * 1024 * 1024;
const maxPartCount = Math.ceil(maxVideoBytes / partBytes);
const maxJsonBytes = 4 * 1024 * 1024;
const maxStretches = 20_000;
const recordingPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

interface PlaybackPoint {episodeTime: number; audioTime: number}
interface Stretch {start: PlaybackPoint; end: PlaybackPoint}
export interface VideoRecording {
  recordingId: string;
  filename: string;
  objectKey: string;
  contentType: 'video/webm';
  bytes: number;
  startedAt: number;
  durationMs: number | null;
  // Seconds on the recording's audio clock at the video's first frame. A stretch maps episode time to
  // audio time; video time is audio time minus this offset.
  videoOffset: number;
  stretches: Stretch[];
}
export interface VideoManifest {
  version: 1;
  episodeId: string;
  recordings: VideoRecording[];
}
class RequestError extends Error {
  constructor(message: string, readonly status = 400) {super(message);}
}

function setup(request: Request) {
  const url = new URL(request.url);
  const origin = request.headers.get('origin');
  if (!['localhost', '127.0.0.1'].includes(url.hostname) ||
      (origin && !/^chrome-extension:\/\/[a-p]{32}$/.test(origin)) ||
      request.headers.get('x-ll-netflix-video') !== '1') {
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
  return {url, episodeId, bucket, prefix: `${language}-video/netflix-${id}/`};
}
type Scope = ReturnType<typeof setup>;

const videoKey = (scope: Scope, recordingId: string) => scope.prefix + recordingId + '.webm';
const finite = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value);
const isPoint = (value: unknown): value is PlaybackPoint =>
  !!value && finite((value as PlaybackPoint).episodeTime) && finite((value as PlaybackPoint).audioTime);

function recordingId(value: unknown) {
  if (typeof value !== 'string' || !recordingPattern.test(value)) throw new RequestError('Invalid recording id.');
  return value;
}
function httpStatus(error: unknown) {
  return (error as {$metadata?: {httpStatusCode?: number}})?.$metadata?.httpStatusCode;
}
function fail(error: unknown) {
  if (error instanceof RequestError) return Response.json({error: error.message}, {status: error.status});
  console.error('Netflix review video storage failed:', error instanceof Error ? error.name : 'Unknown error');
  return Response.json({error: 'Could not update Cloudflare R2. Check the reader configuration and retry.'}, {status: 502});
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
async function storedBytes(scope: Scope, id: string) {
  try {
    const object = await s3.send(new HeadObjectCommand({Bucket: scope.bucket, Key: videoKey(scope, id)}));
    return object.ContentLength || 0;
  } catch (error) {
    if (httpStatus(error) !== 404) throw error;
    return 0;
  }
}
async function readManifest(scope: Scope): Promise<{manifest: VideoManifest; etag?: string}> {
  try {
    const object = await s3.send(new GetObjectCommand({Bucket: scope.bucket, Key: scope.prefix + 'manifest.json'}));
    const manifest = JSON.parse(await object.Body!.transformToString()) as VideoManifest;
    if (manifest.version !== 1 || manifest.episodeId !== scope.episodeId || !Array.isArray(manifest.recordings) || !object.ETag) {
      throw new RequestError('The existing R2 video manifest has an unsupported format.', 409);
    }
    return {manifest, etag: object.ETag};
  } catch (error) {
    if (httpStatus(error) !== 404) throw error;
    return {manifest: {version: 1, episodeId: scope.episodeId, recordings: []}};
  }
}
async function publish(scope: Scope, recording: VideoRecording) {
  for (let attempt = 0; attempt < 4; attempt++) {
    const {manifest, etag} = await readManifest(scope);
    const recordings = [...manifest.recordings.filter(old => old.recordingId !== recording.recordingId), recording]
      .sort((a, b) => a.startedAt - b.startedAt);
    try {
      await s3.send(new PutObjectCommand({
        Bucket: scope.bucket, Key: scope.prefix + 'manifest.json', ContentType: 'application/json',
        Body: JSON.stringify({...manifest, recordings}), CacheControl: 'no-cache',
        ...(etag ? {IfMatch: etag} : {IfNoneMatch: '*'}),
      }));
      return recordings.length;
    } catch (error) {
      if (httpStatus(error) !== 412) throw error;
    }
  }
  throw new RequestError('The episode was updated by another upload. Retry to publish this video.', 409);
}
function recordingDetails(id: string, bytes: number, details: unknown): VideoRecording {
  const {startedAt, durationMs, videoOffset, stretches} = (details || {}) as Partial<VideoRecording>;
  if (!Number.isSafeInteger(startedAt) || startedAt! <= 0) throw new RequestError('Invalid recording start time.');
  if (durationMs != null && (!Number.isSafeInteger(durationMs) || durationMs <= 0)) throw new RequestError('Invalid video duration.');
  if (!finite(videoOffset) || Math.abs(videoOffset) > 60) throw new RequestError('Invalid video offset.');
  if (!Array.isArray(stretches) || stretches.length > maxStretches ||
      !stretches.every(stretch => stretch && isPoint(stretch.start) && isPoint(stretch.end))) {
    throw new RequestError('Invalid playback stretches.');
  }
  return {
    recordingId: id, filename: id + '.webm', objectKey: '', contentType: 'video/webm', bytes,
    startedAt: startedAt!, durationMs: durationMs ?? null, videoOffset,
    stretches: stretches.map(({start, end}) => ({
      start: {episodeTime: start.episodeTime, audioTime: start.audioTime},
      end: {episodeTime: end.episodeTime, audioTime: end.audioTime},
    })),
  };
}

// PUT ?recordingId&uploadId&part=N with one part's bytes (application/octet-stream).
export async function PUT(request: Request) {
  try {
    const scope = setup(request);
    const id = recordingId(scope.url.searchParams.get('recordingId'));
    const uploadId = scope.url.searchParams.get('uploadId') || '';
    const part = Number(scope.url.searchParams.get('part'));
    if (!uploadId || uploadId.length > 1024 || !Number.isSafeInteger(part) || part < 1 || part > maxPartCount ||
        request.headers.get('content-type') !== 'application/octet-stream') {
      throw new RequestError('Invalid video part.');
    }
    const bytes = await readBody(request, partBytes);
    if (!bytes.length) throw new RequestError('Empty video part.');
    if (part === 1 && (bytes.length < 4 || bytes.readUInt32BE(0) !== 0x1a45dfa3)) throw new RequestError('Expected a WebM file.');
    const result = await s3.send(new UploadPartCommand({
      Bucket: scope.bucket, Key: videoKey(scope, id), UploadId: uploadId, PartNumber: part, Body: bytes,
    }));
    if (!result.ETag) throw new Error('R2 returned no part ETag.');
    return Response.json({etag: result.ETag});
  } catch (error) {
    return fail(error);
  }
}

// POST JSON {action: 'start' | 'complete' | 'abort', recordingId, ...}.
export async function POST(request: Request) {
  try {
    const scope = setup(request);
    if (!request.headers.get('content-type')?.startsWith('application/json')) throw new RequestError('Expected JSON.', 415);
    let payload;
    try {payload = JSON.parse((await readBody(request, maxJsonBytes)).toString());}
    catch (error) {if (error instanceof RequestError) throw error; throw new RequestError('Invalid JSON.');}
    const id = recordingId(payload?.recordingId);
    const key = videoKey(scope, id);

    if (payload.action === 'start') {
      const bytes = payload.bytes;
      if (!Number.isSafeInteger(bytes) || bytes <= 0 || bytes > maxVideoBytes) throw new RequestError('Invalid video size.');
      const stored = await storedBytes(scope, id);
      // A finished upload of the same recording is reused; only the manifest entry is refreshed.
      if (stored === bytes) {
        const published = await publish(scope, {...recordingDetails(id, stored, payload.details), objectKey: key});
        return Response.json({exists: true, bytes: stored, objectKey: key, published});
      }
      if (stored) throw new RequestError('A different video is already stored for this recording.', 409);
      recordingDetails(id, bytes, payload.details);
      const created = await s3.send(new CreateMultipartUploadCommand({
        Bucket: scope.bucket, Key: key, ContentType: 'video/webm', CacheControl: 'public, max-age=31536000, immutable',
      }));
      if (!created.UploadId) throw new Error('R2 returned no upload id.');
      return Response.json({exists: false, uploadId: created.UploadId, partBytes});
    }

    const uploadId = payload.uploadId;
    if (typeof uploadId !== 'string' || !uploadId || uploadId.length > 1024) throw new RequestError('Invalid upload id.');

    if (payload.action === 'abort') {
      await s3.send(new AbortMultipartUploadCommand({Bucket: scope.bucket, Key: key, UploadId: uploadId})).catch(error => {
        if (httpStatus(error) !== 404) throw error;
      });
      return Response.json({aborted: true});
    }

    if (payload.action !== 'complete') throw new RequestError('Unknown upload action.');
    const parts = payload.parts;
    if (!Array.isArray(parts) || !parts.length || parts.length > maxPartCount ||
        !parts.every((part, index) => part?.partNumber === index + 1 && typeof part.etag === 'string' && part.etag.length <= 256)) {
      throw new RequestError('Invalid part list.');
    }
    await s3.send(new CompleteMultipartUploadCommand({
      Bucket: scope.bucket, Key: key, UploadId: uploadId,
      MultipartUpload: {Parts: parts.map(({partNumber, etag}) => ({PartNumber: partNumber, ETag: etag}))},
    }));
    const bytes = await storedBytes(scope, id);
    if (!bytes) throw new RequestError('The video is missing in R2 after upload. Retry the upload.', 409);
    const published = await publish(scope, {...recordingDetails(id, bytes, payload.details), objectKey: key});
    return Response.json({bytes, objectKey: key, published});
  } catch (error) {
    return fail(error);
  }
}
