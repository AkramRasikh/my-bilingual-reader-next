import {randomUUID} from 'node:crypto';
import {fetchLocalSubtitles} from './subtitles';
export const runtime = 'nodejs';
type Job = {id: string; videoId: string; language: string; includeEnglish: boolean; status: 'fetching' | 'ready' | 'error'; result?: Awaited<ReturnType<typeof fetchLocalSubtitles>>; error?: string};
const state = globalThis as typeof globalThis & {checkpointSubtitleJobs?: Map<string, Job>};
const jobs = state.checkpointSubtitleJobs ??= new Map<string, Job>();
function guard(req: Request) {
  const url = new URL(req.url), origin = req.headers.get('origin');
  if (!['localhost', '127.0.0.1', '[::1]'].includes(url.hostname) || (origin && origin !== url.origin && !/^chrome-extension:\/\/[a-p]{32}$/.test(origin))) {
    return Response.json({error: 'Local subtitle fetching is available only on localhost.'}, {status: 403});
  }
}
export async function GET(req: Request) {
  const denied = guard(req); if (denied) return denied;
  const job = jobs.get(new URL(req.url).searchParams.get('jobId') || '');
  return job ? Response.json(job) : Response.json({error: 'Subtitle job not found. Start the manual fallback again.'}, {status: 404});
}
export async function POST(req: Request) {
  const denied = guard(req); if (denied) return denied;
  if (!req.headers.get('content-type')?.startsWith('application/json')) return Response.json({error: 'Expected JSON.'}, {status: 415});
  let body;
  try {body = await req.json();} catch {return Response.json({error: 'Invalid JSON.'}, {status: 400});}
  if (!body || typeof body.videoId !== 'string' || !/^[\w-]{1,64}$/.test(body.videoId) ||
    !['chinese', 'japanese', 'arabic', 'french'].includes(body.language) || typeof body.includeEnglish !== 'boolean') {
    return Response.json({error: 'Invalid video, language, or English option.'}, {status: 400});
  }
  const active = [...jobs.values()].filter(job => job.status === 'fetching');
  const existing = active.find(job => job.videoId === body.videoId && job.language === body.language && job.includeEnglish === body.includeEnglish);
  if (existing) return Response.json(existing, {status: 202});
  if (active.length >= 2) return Response.json({error: 'Wait for the current subtitle fetches to finish.'}, {status: 429});
  const job: Job = {id: randomUUID(), videoId: body.videoId, language: body.language, includeEnglish: body.includeEnglish, status: 'fetching'};
  jobs.set(job.id, job);
  // Bound retained results; this is a local process queue, not a persistent job system.
  for (const [key, value] of jobs) {if (jobs.size <= 20) break; if (value.status !== 'fetching') jobs.delete(key);}
  void fetchLocalSubtitles(job.videoId, job.language, job.includeEnglish).then(result => {
    job.result = result; job.status = 'ready';
  }, error => {
    console.error('Manual yt-dlp subtitle fetch failed:', error);
    job.status = 'error'; job.error = /429/.test(String(error?.stderr || error?.message))
      ? 'YouTube also rate-limited yt-dlp (429). Wait before trying again. Cached captions are unchanged.'
      : 'yt-dlp could not fetch the subtitles. Check the reader server logs. Cached captions are unchanged.';
  });
  return Response.json(job, {status: 202});
}
