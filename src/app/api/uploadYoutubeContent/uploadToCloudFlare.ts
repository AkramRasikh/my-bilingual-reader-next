import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';

const s3 = new S3Client({
  region: 'auto',
  endpoint: process.env.NEXT_PUBLIC_CLOUD_FLARE_ENDPOINT as string,
  credentials: {
    accessKeyId: process.env.NEXT_PUBLIC_CLOUD_FLARE_ACCESS_KEY_ID as string,
    secretAccessKey: process.env
      .NEXT_PUBLIC_CLOUD_FLARE_SECRET_ACCESS_KEY as string,
  },
});

export const uploadBufferToCloudFlare = async ({ buffer, filePath }) => {
  try {
    const command = new PutObjectCommand({
      Bucket: process.env.CLOUD_FLARE_R2_BUCKET_NAME,
      Key: filePath,
      Body: buffer,
      ContentType: 'audio/mpeg',
    });
    const uploadResponse = await s3.send(command);

    if (uploadResponse) {
      console.log('## uploadResponse', uploadResponse);
      return true;
    }

    return;
  } catch (error) {
    console.error('## Error uploading file to cloudFlare:', error);
  }
};
