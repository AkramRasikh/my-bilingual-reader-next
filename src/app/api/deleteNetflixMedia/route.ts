import {
  AbortMultipartUploadCommand,
  DeleteObjectsCommand,
  ListMultipartUploadsCommand,
  ListObjectsV2Command,
} from '@aws-sdk/client-s3';
import {s3} from '../../shared-apis/s3-instance';

// Deletes every R2 object uploaded for one Netflix episode: review audio clips, whole tab-recording
// videos, and their manifests. Unfinished multipart video uploads are aborted so no parts linger.
// Manifests go first so a partial failure never leaves a manifest pointing at deleted media; the
// request is idempotent, so retrying after a failure finishes the job.
export const runtime = 'nodejs';

function netflixMediaPrefixes(language: string, episodeId: string) {
  const id = /^netflix:(\d{1,20})$/.exec(episodeId)?.[1];
  if (!id || !['japanese', 'chinese', 'arabic', 'french'].includes(language)) return;
  return [`${language}-audio/netflix-${id}/`, `${language}-video/netflix-${id}/`];
}

async function listKeys(bucket: string, prefix: string) {
  const keys: string[] = [];
  let ContinuationToken: string | undefined;
  do {
    const page = await s3.send(new ListObjectsV2Command({Bucket: bucket, Prefix: prefix, ContinuationToken}));
    for (const object of page.Contents || []) if (object.Key?.startsWith(prefix)) keys.push(object.Key);
    ContinuationToken = page.IsTruncated ? page.NextContinuationToken : undefined;
  } while (ContinuationToken);
  return keys;
}

async function deleteKeys(bucket: string, keys: string[]) {
  for (let i = 0; i < keys.length; i += 1000) {
    const result = await s3.send(new DeleteObjectsCommand({
      Bucket: bucket,
      Delete: {Objects: keys.slice(i, i + 1000).map(Key => ({Key})), Quiet: true},
    }));
    if (result.Errors?.length) throw new Error(`R2 refused to delete ${result.Errors.length} objects.`);
  }
}

async function abortUploads(bucket: string, prefix: string) {
  let aborted = 0;
  let KeyMarker: string | undefined;
  let UploadIdMarker: string | undefined;
  do {
    const page = await s3.send(new ListMultipartUploadsCommand({Bucket: bucket, Prefix: prefix, KeyMarker, UploadIdMarker}));
    for (const upload of page.Uploads || []) {
      if (!upload.Key?.startsWith(prefix) || !upload.UploadId) continue;
      await s3.send(new AbortMultipartUploadCommand({Bucket: bucket, Key: upload.Key, UploadId: upload.UploadId}));
      aborted++;
    }
    KeyMarker = page.IsTruncated ? page.NextKeyMarker : undefined;
    UploadIdMarker = page.IsTruncated ? page.NextUploadIdMarker : undefined;
  } while (KeyMarker);
  return aborted;
}

// POST JSON {episodeId: 'netflix:<id>', language: 'japanese' | ...}.
export async function POST(request: Request) {
  let body: {episodeId?: unknown; language?: unknown};
  try {
    body = await request.json();
  } catch {
    return Response.json({error: 'Invalid JSON.'}, {status: 400});
  }
  const prefixes = netflixMediaPrefixes(String(body?.language ?? '').toLowerCase(), String(body?.episodeId ?? ''));
  if (!prefixes) return Response.json({error: 'Invalid episode or study language.'}, {status: 400});
  const bucket = process.env.CLOUD_FLARE_R2_BUCKET_NAME || process.env.NEXT_PUBLIC_CLOUD_FLARE_R2_BUCKET_NAME;
  if (!bucket) return Response.json({error: 'Cloudflare R2 is not configured.'}, {status: 503});

  try {
    let deleted = 0;
    let aborted = 0;
    for (const prefix of prefixes) {
      aborted += await abortUploads(bucket, prefix);
      const keys = await listKeys(bucket, prefix);
      const manifests = keys.filter(key => key === prefix + 'manifest.json');
      await deleteKeys(bucket, manifests);
      await deleteKeys(bucket, keys.filter(key => !manifests.includes(key)));
      deleted += keys.length;
    }
    return Response.json({deleted, aborted});
  } catch (error) {
    console.error('Netflix media delete failed:', error instanceof Error ? error.name : 'Unknown error');
    return Response.json({error: 'Could not delete the Netflix media from Cloudflare R2. Retry.'}, {status: 502});
  }
}
