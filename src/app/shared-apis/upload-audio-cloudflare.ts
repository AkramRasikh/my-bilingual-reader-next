import { PutObjectCommand } from '@aws-sdk/client-s3';
import { s3 } from './s3-instance';

export const getAudioFolderViaLang = (languageStr: string): string =>
  `${languageStr}-audio`;

export const uploadAudioCloudflare = async ({
  localAudioPath,
  cloudFlareAudioName,
}) => {
  const audioResponse = await fetch(localAudioPath);
  console.log('## audioResponse', audioResponse);
  if (!audioResponse.ok) {
    console.log('## FAIL audio response');
    return false;
  }

  const arrayBuffer = await audioResponse.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const command = new PutObjectCommand({
    Bucket: process.env.NEXT_PUBLIC_CLOUD_FLARE_R2_BUCKET_NAME,
    Key: getAudioFolderViaLang('japanese') + '/' + cloudFlareAudioName + '.mp3',
    Body: buffer,
    ContentType: 'audio/mpeg',
  });
  const uploadResponse = await s3.send(command);
  if (uploadResponse) {
    console.log('## uploadResponse', uploadResponse);
    return;
  } else {
    return false;
  }
};
