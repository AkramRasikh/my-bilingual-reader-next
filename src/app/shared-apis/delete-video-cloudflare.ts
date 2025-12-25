import { DeleteObjectCommand } from '@aws-sdk/client-s3';
import { s3 } from './s3-instance';

export const getVideoFolderViaLang = (languageStr: string): string =>
  `${languageStr}-video`;

export const deleteVideoCloudflare = async ({ key }: { key: string }) => {
  const command = new DeleteObjectCommand({
    Bucket: process.env.NEXT_PUBLIC_CLOUD_FLARE_R2_BUCKET_NAME,
    Key: key,
  });

  try {
    const deleteResponse = await s3.send(command);
    console.log('## Video deleted successfully', deleteResponse);
    return true;
  } catch (error) {
    console.error('## Error deleting video:', error);
    return false;
  }
};
