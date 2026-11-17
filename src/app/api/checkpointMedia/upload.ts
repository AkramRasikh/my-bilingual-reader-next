import {createReadStream} from 'node:fs';
import {stat} from 'node:fs/promises';
import {PutObjectCommand} from '@aws-sdk/client-s3';
import {s3} from '../../shared-apis/s3-instance';

export async function uploadCheckpointFile(file: string, key: string, contentType: string, videoId: string) {
  const bucket = process.env.CLOUD_FLARE_R2_BUCKET_NAME || process.env.NEXT_PUBLIC_CLOUD_FLARE_R2_BUCKET_NAME;
  if (!bucket) throw new Error('Cloudflare R2 bucket is not configured on the Next server.');
  const info = await stat(file);
  if (!info.size) throw new Error('Cannot upload an empty media file.');
  const stream = createReadStream(file);
  try {
    const result = await s3.send(new PutObjectCommand({Bucket: bucket, Key: key,
      Body: stream, ContentLength: info.size, ContentType: contentType,
      Metadata: {'youtube-id': videoId}}));
    const status = result.$metadata.httpStatusCode;
    if (!status || status < 200 || status >= 300) throw new Error('Cloudflare did not confirm the media upload.');
  } finally {stream.destroy();}
}
