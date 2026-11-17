import { buildImportPayload } from './payload';

export const runtime = 'nodejs';
const maxBytes = 8 * 1024 * 1024;

export async function POST(req: Request) {
  const url = new URL(req.url);
  if (!['localhost', '127.0.0.1', '[::1]'].includes(url.hostname)) {
    return Response.json({error: 'Token-free imports are available only through localhost.'}, {status: 403});
  }
  const origin = req.headers.get('origin');
  if (origin && origin !== url.origin && !/^chrome-extension:\/\/[a-p]{32}$/.test(origin)) {
    return Response.json({error: 'This origin cannot import content.'}, {status: 403});
  }
  if (!req.headers.get('content-type')?.toLowerCase().startsWith('application/json')) {
    return Response.json({error: 'Content-Type must be application/json.'}, {status: 415});
  }
  if (Number(req.headers.get('content-length')) > maxBytes) {
    return Response.json({error: 'Upload exceeds 8 MB.'}, {status: 413});
  }
  let payload;
  try {
    // Bound the actual stream as well as Content-Length before decoding JSON.
    const reader = req.body?.getReader();
    if (!reader) throw new Error('Request body is required');
    const chunks: Uint8Array[] = [];
    let size = 0;
    while (true) {
      const {done, value} = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > maxBytes) {
        await reader.cancel();
        return Response.json({error: 'Upload exceeds 8 MB.'}, {status: 413});
      }
      chunks.push(value);
    }
    payload = buildImportPayload(JSON.parse(Buffer.concat(chunks).toString('utf8')));
  } catch (error) {
    return Response.json({error: error instanceof Error ? error.message : 'Invalid import'}, {status: 400});
  }
  try {
    // Credentials remain on the server, using the same Admin app as media uploads.
    const {db} = await import('../uploadYoutubeContent/firebase-admin-init');
    const path = `${payload.language}/content/${payload.id}`;
    const result = await db.ref(path).transaction(current => current === null ? payload.content : undefined);
    if (!result.committed) {
      return Response.json({error: 'This content ID already exists. Nothing was overwritten.', contentId: payload.id, path}, {status: 409});
    }
    return Response.json({contentId: payload.id, path, newContentData: payload.content,
      transcriptCount: payload.content.content.length,
      reviewedSentenceCount: payload.content.content.filter(line => 'reviewData' in line).length,
      snippetCount: Object.keys(payload.content.snippets).length}, {status: 201});
  } catch (error) {
    console.error('Checkpoint database import failed:', error);
    return Response.json({error: 'Firebase import failed. Check the reader server logs.'}, {status: 500});
  }
}
