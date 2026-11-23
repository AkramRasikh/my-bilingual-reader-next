export async function GET(request: Request) {
  const query = new URL(request.url).searchParams;
  const language = query.get('language') || '';
  const id = /^netflix:(\d{1,20})$/.exec(query.get('episodeId') || '')?.[1];
  if (!id || !['japanese', 'chinese', 'arabic', 'french'].includes(language)) {
    return Response.json({error: 'Invalid episode or study language.'}, {status: 400});
  }

  const assets = process.env.NEXT_PUBLIC_CLOUDFLARE_ASSETS_URL;
  if (!assets) return Response.json({error: 'Cloudflare assets are not configured.'}, {status: 503});
  try {
    const url = new URL(`${language}-audio/netflix-${id}/manifest.json`, assets.replace(/\/?$/, '/'));
    const result = await fetch(url, {cache: 'no-store', redirect: 'error', signal: AbortSignal.timeout(8000)});
    if (result.status === 404) return Response.json({error: 'No uploaded review audio.'}, {status: 404});
    if (!result.ok) throw new Error('Cloudflare did not return the manifest.');
    const manifest = await result.json();
    return Response.json(manifest, {headers: {'Cache-Control': 'no-store'}});
  } catch {
    return Response.json({error: 'Could not load the Cloudflare audio manifest.'}, {status: 502});
  }
}
