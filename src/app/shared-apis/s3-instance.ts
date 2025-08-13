import { S3Client } from '@aws-sdk/client-s3';

export const s3 = new S3Client({
  region: 'auto',
  endpoint: process.env.NEXT_PUBLIC_CLOUD_FLARE_ENDPOINT as string,
  credentials: {
    accessKeyId: process.env.NEXT_PUBLIC_CLOUD_FLARE_ACCESS_KEY_ID as string,
    secretAccessKey: process.env
      .NEXT_PUBLIC_CLOUD_FLARE_SECRET_ACCESS_KEY as string,
  },
});
