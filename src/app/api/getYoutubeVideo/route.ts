import { runYoutubeDownload } from './runYoutubeDownload';

export async function POST(req) {
  try {
    const body = await req.json();
    const result = await runYoutubeDownload(body);
    return new Response(JSON.stringify(result.body), {
      status: result.status,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
    });
  }
}
