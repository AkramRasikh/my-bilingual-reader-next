import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';

export const getAudioFolderViaLang = (languageStr: string): string =>
  `${languageStr}-audio`;

const s3 = new S3Client({
  region: 'auto',
  endpoint: process.env.NEXT_PUBLIC_CLOUD_FLARE_ENDPOINT as string,
  credentials: {
    accessKeyId: process.env.NEXT_PUBLIC_CLOUD_FLARE_ACCESS_KEY_ID as string,
    secretAccessKey: process.env
      .NEXT_PUBLIC_CLOUD_FLARE_SECRET_ACCESS_KEY as string,
  },
});

export async function POST(req: Request) {
  const body = await req.json();

  const localAudioPath = 'http://localhost:3000' + body.localAudioPath;

  console.log('## localAudioPath', localAudioPath);

  // Fetch the audio file from public/audio/{id}
  // const audioUrl = `${process.env.NEXT_PUBLIC_BASE_URL || ''}/audio/${id}`;

  // const url = process.env.NEXT_PUBLIC_NEXT_PUBLIC_ADD_SENTENCE_URL as string;
  const url =
    'http://127.0.0.1:5001/language-content-storage/us-central1/addAlreadyGeneratedSentence';

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const data = await response.json();

  console.log('## data', data);
  const thisId = data[0].id;
  console.log('## data', data[0].id);

  if (data) {
    const audioResponse = await fetch(localAudioPath);
    if (!audioResponse.ok) {
      console.log('## FAIL audio response');
    }

    const arrayBuffer = await audioResponse.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const command = new PutObjectCommand({
      Bucket: process.env.NEXT_PUBLIC_CLOUD_FLARE_R2_BUCKET_NAME,
      Key: getAudioFolderViaLang('japanese') + '/' + thisId + '.mp3',
      Body: buffer,
      ContentType: 'audio/mpeg',
    });
    const uploadResponse = await s3.send(command);
    if (uploadResponse) {
      console.log('## uploadResponse', uploadResponse);
    }
  }

  return new Response(JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json' },
    status: response.status,
  });
}
