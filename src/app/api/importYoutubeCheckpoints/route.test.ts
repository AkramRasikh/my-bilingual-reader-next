/** @jest-environment node */
import {POST} from './route';
import {srsCalculationAndText, srsRetentionKeyTypes} from '../../srs-utils/srs-algo';
import {buildImportPayload} from './payload';
const transaction = jest.fn();
const ref = jest.fn((_path: string) => ({transaction}));
jest.mock('../uploadYoutubeContent/firebase-admin-init', () => ({db: {ref: (path: string) => ref(path)}}));
const contentId = 'JyJGBINzLZc';
const transcriptId = '148d7b26-25cc-45fc-a33e-dc6e860b3597';
const snippetId = '004e4e76-55a1-408f-bf0f-b657c606617a';
const payload = () => ({contentId, videoId: 'JyJGBINzLZc', title: 'Monster', language: 'Chinese',
  transcript: [{id: transcriptId, time: 126, targetLang: '用语', baseLang: 'language'}],
  snippets: [{id: snippetId, time: 126.25, isContracted: true, isPreSnippet: true,
    suggestedFocusText: '用', targetLang: '用语', baseLang: 'language', status: 'caption_matched'}]});
const request = (body: unknown = payload(), url = 'http://localhost/api/importYoutubeCheckpoints', origin?: string) => new Request(url, {
  method: 'POST', headers: {'Content-Type': 'application/json', ...(origin ? {Origin: origin} : {})}, body: JSON.stringify(body)});

beforeEach(() => {jest.clearAllMocks();});

test('builds the reader schema with UUID-keyed snippets and no media upload', () => {
  const result = buildImportPayload(payload());
  expect(result.language).toBe('chinese');
  expect(result.id).toBe(payload().videoId);
  expect(result.content.id).toBe(payload().videoId);
  expect(result.content).not.toHaveProperty('hasAudio');
  expect(result.content.content[0].id).toBe(transcriptId);
  expect(result.content.snippets[snippetId]).toMatchObject({id: snippetId, time: 126.25,
    isContracted: true, isPreSnippet: true, suggestedFocusText: '用', targetLang: '用语', baseLang: 'language'});
  expect(result.content.url).toBe('https://www.youtube.com/watch?v=JyJGBINzLZc');
});

test('rejects remote hosts and unrelated browser origins before accessing Firebase', async () => {
  expect((await POST(request(payload(), 'https://reader.example/api/importYoutubeCheckpoints'))).status).toBe(403);
  expect((await POST(request(payload(), undefined, 'https://unrelated.example'))).status).toBe(403);
  expect(ref).not.toHaveBeenCalled();
});

test('accepts local extension uploads without a token', async () => {
  transaction.mockResolvedValue({committed: true});
  expect((await POST(request(payload(), undefined, 'chrome-extension://' + 'a'.repeat(32)))).status).toBe(201);
});

test.each([
  {...payload(), language: '../../other'},
  {...payload(), contentId: 'different-video'},
  {...payload(), contentId: '../bad', videoId: '../bad'},
  {...payload(), transcript: []},
  {...payload(), transcript: [{id: transcriptId, time: -1, targetLang: 'x', baseLang: ''}]},
  {...payload(), snippets: [payload().snippets[0], payload().snippets[0]]},
])('rejects malformed payload without a database write', async body => {
  expect((await POST(request(body))).status).toBe(400);
  expect(ref).not.toHaveBeenCalled();
});

test('writes once at the expected path and refuses to overwrite existing data', async () => {
  transaction.mockImplementation(async update => {
    expect(update(null).id).toBe(contentId);
    expect(update({existing: true})).toBeUndefined();
    return {committed: true};
  });
  const result = await POST(request());
  expect(result.status).toBe(201);
  expect(ref).toHaveBeenCalledWith(`chinese/content/${contentId}`);
  expect(await result.json()).toMatchObject({contentId, transcriptCount: 1, snippetCount: 1});
  transaction.mockResolvedValue({committed: false});
  expect((await POST(request())).status).toBe(409);
});


test('creates the same initial snippet review card as the frontend, with Firebase-safe dates', () => {
  jest.useFakeTimers().setSystemTime(new Date('2026-11-17T12:00:00.000Z'));
  try {
    const expected = srsCalculationAndText({contentType: srsRetentionKeyTypes.snippet, timeNow: new Date()})
      .nextScheduledOptions['1'].card;
    const body = payload();
    const result = buildImportPayload(body);
    const reviewData = JSON.parse(JSON.stringify(expected));
    expect(result.content.snippets[snippetId]).toMatchObject({reviewData});
    expect(typeof reviewData.due).toBe('string');
    expect(typeof reviewData.last_review).toBe('string');
    expect(reviewData.reps).toBe(1);
    expect(Number.isFinite(new Date(reviewData.due).getTime())).toBe(true);
    expect(result.content.content[0]).not.toHaveProperty('reviewData');
    expect(body.snippets[0]).not.toHaveProperty('reviewData');
  } finally {jest.useRealTimers();}
});

test('writes generated reviewData through the content creation transaction', async () => {
  transaction.mockImplementation(async update => {
    const content = update(null);
    expect(content.snippets[snippetId].reviewData).toMatchObject({reps: 1});
    expect(typeof content.snippets[snippetId].reviewData.due).toBe('string');
    expect(update({snippets: {[snippetId]: {reviewData: {reps: 10}}}})).toBeUndefined();
    return {committed: true};
  });
  expect((await POST(request())).status).toBe(201);
});

test('automatically schedules qualifying transcript lines with the frontend bulk-review Hard card', () => {
  jest.useFakeTimers().setSystemTime(new Date('2026-11-17T12:00:00.000Z'));
  try {
    const body = {...payload(), mediaDuration: 128,
      // Contracted snippet at 126.25 covers 1 of these 2 seconds: exactly 50%.
      transcript: [{id: transcriptId, time: 126, targetLang: '用语', baseLang: 'language'}]};
    const expected = srsCalculationAndText({contentType: srsRetentionKeyTypes.sentences, timeNow: new Date()})
      .nextScheduledOptions['2'].card;
    const result = buildImportPayload(body);
    expect(result.content.content[0]).toMatchObject({reviewData: JSON.parse(JSON.stringify(expected))});
    expect(body.transcript[0]).not.toHaveProperty('reviewData');
    const belowThreshold = buildImportPayload({...body, mediaDuration: 130});
    expect(belowThreshold.content.content[0]).not.toHaveProperty('reviewData');
  } finally {jest.useRealTimers();}
});

test('imports Netflix with a collision-proof ID, target-only text, and server review cards', async () => {
  const body = {...payload(), origin:'netflix',videoId:'12345678',contentId:'netflix:12345678',mediaDuration:130,
    transcript:[{id:transcriptId,time:126,targetLang:'学习',baseLang:''}],
    snippets:[{...payload().snippets[0],time:127.5,isContracted:false,baseLang:''}]};
  const built = buildImportPayload(body);
  expect(built.content).toMatchObject({id:'netflix:12345678',origin:'netflix',url:'https://www.netflix.com/watch/12345678'});
  expect(built.content.snippets[snippetId].reviewData.due).toBeDefined();
  expect(built.content.content[0]).toHaveProperty('reviewData');
  expect(() => buildImportPayload({...body,contentId:'12345678'})).toThrow();
  expect(() => buildImportPayload({...body,origin:'youtube'})).toThrow();
  transaction.mockResolvedValue({committed:true});
  expect((await POST(request(body))).status).toBe(201);
  expect(ref).toHaveBeenCalledWith('chinese/content/netflix:12345678');
});
