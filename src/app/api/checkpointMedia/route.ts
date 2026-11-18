import {getMediaJob, retryMediaJob, startMediaJob} from './jobs';
export const runtime = 'nodejs';
function guard(req: Request) {
  const url = new URL(req.url), origin = req.headers.get('origin');
  if (!['localhost', '127.0.0.1', '[::1]'].includes(url.hostname) ||
      (origin && origin !== url.origin && !/^chrome-extension:\/\/[a-p]{32}$/.test(origin))) {
    return Response.json({error: 'Media downloads are available only through your local reader app.'}, {status: 403});
  }
}
export async function GET(req: Request) {
  const denied = guard(req); if (denied) return denied;
  const job = getMediaJob(new URL(req.url).searchParams.get('jobId') || '');
  return job ? Response.json(job) : Response.json({error: 'Download job not found. The reader may have restarted; start the download again.'}, {status: 404});
}
export async function POST(req: Request) {
  const denied = guard(req); if (denied) return denied;
  if (!req.headers.get('content-type')?.startsWith('application/json')) return Response.json({error: 'Expected JSON.'}, {status: 415});
  let body;
  try {body = await req.json();} catch {return Response.json({error: 'Invalid JSON.'}, {status: 400});}
  if (!body || typeof body !== 'object') return Response.json({error: 'Invalid request.'}, {status: 400});
  if (body.jobId) {
    const job = getMediaJob(body.jobId);
    if (!job) return Response.json({error: 'Download job not found.'}, {status: 404});
    try {retryMediaJob(job, body.videoFormatId, body.audioFormatId);}
    catch (error) {return Response.json({error: error instanceof Error ? error.message : 'Invalid formats.'}, {status: 400});}
    return Response.json(job, {status: 202});
  }
  const {contentId, language} = body;
  if (typeof contentId !== 'string' || !/^[\w-]{1,64}$/.test(contentId) ||
      !['arabic', 'chinese', 'japanese', 'french'].includes(language)) {
    return Response.json({error: 'Invalid video ID or language.'}, {status: 400});
  }
  try {
    const {db} = await import('../uploadYoutubeContent/firebase-admin-init');
    const snapshot = await db.ref(`${language}/content/${contentId}`).once('value');
    if (!snapshot.exists()) return Response.json({error: 'Upload the transcript and snippets first.'}, {status: 409});
    if (snapshot.val()?.origin === 'netflix') return Response.json({error: 'Netflix media downloads are not supported.'}, {status: 400});
    const title = snapshot.val()?.title;
    if (typeof title !== 'string' || !title.trim()) return Response.json({error: 'The content record needs a title.'}, {status: 400});
    return Response.json(await startMediaJob(contentId, language, title), {status: 202});
  } catch (error) {
    console.error('Checkpoint media download failed:', error);
    return Response.json({error: 'Could not start media download. Check the local reader logs.'}, {status: 500});
  }
}
