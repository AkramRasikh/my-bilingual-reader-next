import { uploadAudioCloudflare } from '@/app/shared-apis/upload-audio-cloudflare';
import { addContentLogic } from './uploadContentToFirebase';

export async function POST(req) {
  try {
    const { url, title, language, publicAudioUrl, transcript } =
      await req.json();

    let contentUploaded = false;
    let audioUploaded = false;

    if (!url || !title || !language || !publicAudioUrl || !transcript) {
      return new Response(
        JSON.stringify({
          error:
            'Missing either: url, title, language, publicAudioUrl or transcript',
        }),
        {
          status: 400,
        },
      );
    }

    audioUploaded = await uploadAudioCloudflare({
      localAudioPath: 'http://localhost:3000' + publicAudioUrl,
      cloudFlareAudioName: title,
      language,
    });

    const resUploadContent = await addContentLogic({
      language,
      content: {
        title,
        hasAudio: audioUploaded,
        origin: 'youtube',
        content: transcript,
        url,
      },
    });

    contentUploaded = Boolean(resUploadContent);

    return new Response(
      JSON.stringify({
        contentUploaded,
        audioUploaded,
      }),
      {
        headers: { 'Content-Type': 'application/json' },
      },
    );
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
    });
  }
}
