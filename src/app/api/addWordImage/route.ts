import { NextRequest, NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const s3 = new S3Client({
  region: 'auto',
  endpoint: process.env.NEXT_PUBLIC_CLOUD_FLARE_ENDPOINT as string,
  credentials: {
    accessKeyId: process.env.NEXT_PUBLIC_CLOUD_FLARE_ACCESS_KEY_ID as string,
    secretAccessKey: process.env
      .NEXT_PUBLIC_CLOUD_FLARE_SECRET_ACCESS_KEY as string,
  },
});

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get('image') as File | null;
  const language = formData.get('language') as File | null;
  const updateWordUrl = process.env.NEXT_PUBLIC_UPDATE_WORD_URL as string;

  if (!file) {
    return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
  }

  // Convert the file to a buffer
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const filename = `${file.name}`;
  const wordId = filename.split('.')[0];
  // Upload directly to S3
  const formattedFirebaseName = `${language}-words/` + filename;

  const uploadRes = await s3.send(
    new PutObjectCommand({
      Bucket: process.env.NEXT_PUBLIC_CLOUD_FLARE_R2_BUCKET_NAME,
      Key: formattedFirebaseName,
      Body: buffer,
      ContentType: file.type,
    }),
  );

  if (uploadRes.$metadata.httpStatusCode === 200) {
    const response = await fetch(updateWordUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: wordId,
        fieldToUpdate: { imageUrl: filename },
        language: language,
      }),
    });
    const data = await response.json();

    return new Response(JSON.stringify(data), {
      headers: { 'Content-Type': 'application/json' },
      status: response.status,
    });
  } else {
    return new Response(null, {
      headers: { 'Content-Type': 'application/json' },
      status: 400,
    });
  }
}
