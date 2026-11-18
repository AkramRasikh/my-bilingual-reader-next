import {coveredSentenceIds} from './coverage';
import {getEmptyCard, getNextScheduledOptions, srsCalculationAndText, srsRetentionKeyTypes} from '../../srs-utils/srs-algo';

const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const languages = ['arabic', 'japanese', 'chinese', 'french'];

type Row = Record<string, unknown>;
function object(value: unknown): Row {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Expected an object');
  return value as Row;
}
function text(value: unknown, name: string, max = 100000): string {
  if (typeof value !== 'string' || value.length > max) throw new Error(`Invalid ${name}`);
  return value;
}
function item(value: unknown) {
  const row = object(value);
  if (typeof row.id !== 'string' || !uuid.test(row.id)) throw new Error('Each item needs a UUID');
  if (typeof row.time !== 'number' || !Number.isFinite(row.time) || row.time < 0) throw new Error('Invalid item time');
  return {id: row.id, time: row.time,
    targetLang: text(row.targetLang, 'targetLang'), baseLang: text(row.baseLang, 'baseLang')};
}

export function buildImportPayload(value: unknown) {
  const body = object(value);
  const id = text(body.contentId, 'contentId', 64);
  const language = text(body.language, 'language', 20).toLowerCase();
  if (!languages.includes(language)) throw new Error('Unsupported language');
  const title = text(body.title, 'title', 160).trim();
  if (!title) throw new Error('Content title is required');
  const videoId = text(body.videoId, 'videoId', 64);
  const origin = body.origin === undefined ? 'youtube' : text(body.origin, 'origin', 20);
  if (!['youtube', 'netflix'].includes(origin)) throw new Error('Unsupported origin');
  if (origin === 'netflix' && !/^\d{1,20}$/.test(videoId)) throw new Error('Invalid Netflix video ID');
  if (!/^[\w-]{1,64}$/.test(videoId)) throw new Error('Invalid YouTube video ID');
  if (id !== (origin === 'netflix' ? `netflix:${videoId}` : videoId)) throw new Error('Content ID must match the namespaced video ID');
  if (!Array.isArray(body.transcript) || !body.transcript.length || body.transcript.length > 20000) {
    throw new Error('A cached transcript with 1–20000 lines is required');
  }
  if (!Array.isArray(body.snippets) || body.snippets.length > 20000) throw new Error('Invalid snippets');
  const content = body.transcript.map(item).sort((a, b) => a.time - b.time);
  if (new Set(content.map(row => row.id)).size !== content.length) throw new Error('Duplicate transcript IDs');
  const mediaDuration = body.mediaDuration ?? null;
  if (mediaDuration !== null && (typeof mediaDuration !== 'number' || !Number.isFinite(mediaDuration) || mediaDuration <= content[content.length - 1].time)) {
    throw new Error('Media duration must be after the last transcript start');
  }
  const snippets: Record<string, ReturnType<typeof item> & {
    reviewData: {due?: unknown}; isContracted: boolean; isPreSnippet: boolean;
    suggestedFocusText: string; focusedText?: string;
  }> = {};
  for (const value of body.snippets) {
    const row = object(value), clean = item(value);
    if (snippets[clean.id]) throw new Error('Duplicate snippet IDs');
    for (const field of ['isContracted', 'isPreSnippet']) {
      if (row[field] !== undefined && typeof row[field] !== 'boolean') throw new Error(`Invalid ${field}`);
    }
    // Match LearningScreenProvider.handleQuickSaveSnippet: initial Again card.
    const {nextScheduledOptions} = srsCalculationAndText({
      contentType: srsRetentionKeyTypes.snippet, timeNow: new Date(),
    });
    // Browser requests stringify these Dates; do the same before writing via
    // Firebase Admin so due/last_review are stored as ISO strings, not objects.
    const reviewData = JSON.parse(JSON.stringify(nextScheduledOptions['1'].card));
    snippets[clean.id] = {...clean, reviewData,
      isContracted: Boolean(row.isContracted), isPreSnippet: row.isPreSnippet === undefined ? true : Boolean(row.isPreSnippet),
      suggestedFocusText: row.suggestedFocusText === undefined ? '' : text(row.suggestedFocusText, 'suggestedFocusText'),
      ...(row.focusedText === undefined ? {} : {focusedText: text(row.focusedText, 'focusedText')})};
  }
  const eligible = new Set(coveredSentenceIds(content, Object.values(snippets), mediaDuration));
  // Match handleAddOverlappedSnippetsToReview: initial sentence Hard card.
  const sentenceReview = eligible.size ? JSON.parse(JSON.stringify(getNextScheduledOptions({
    card: getEmptyCard(), contentType: srsRetentionKeyTypes.sentences,
  })['2'].card)) : null;
  const scheduledContent = content.map(line => eligible.has(line.id) ? {...line, reviewData: {...sentenceReview}} : line);
  return {language, id, content: {
    id, title, origin, url: origin === 'netflix' ? `https://www.netflix.com/watch/${videoId}` : `https://www.youtube.com/watch?v=${videoId}`,
    content: scheduledContent, snippets, createdAt: new Date().toISOString(),
  }};
}
