/** @jest-environment node */
import {GET, POST} from './route';
import {getMediaJob, retryMediaJob, startMediaJob} from './jobs';
jest.mock('./jobs', () => ({getMediaJob: jest.fn(), retryMediaJob: jest.fn(), startMediaJob: jest.fn()}));
const once = jest.fn();
const ref = jest.fn((_path: string) => ({once}));
jest.mock('../uploadYoutubeContent/firebase-admin-init', () => ({db: {ref: (value: string) => ref(value)}}));
const payload = {contentId: 'JyJGBINzLZc', language: 'chinese'};
const request = (body = payload, host = 'localhost') => new Request(`http://${host}/api/checkpointMedia`, {
  method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(body)});
beforeEach(() => {jest.clearAllMocks();});
test('requires the database record before starting media download', async () => {
  once.mockResolvedValue({exists: () => false});
  expect((await POST(request())).status).toBe(409);
  expect(startMediaJob).not.toHaveBeenCalled();
  once.mockResolvedValue({exists: () => true, val: () => ({title: 'Monster'})});
  jest.mocked(startMediaJob).mockResolvedValue({id: 'job', ...payload, status: 'downloading', directory: '/tmp/job', formats: []});
  expect((await POST(request())).status).toBe(202);
  expect(ref).toHaveBeenCalledWith('chinese/content/JyJGBINzLZc');
  expect(startMediaJob).toHaveBeenCalledWith(payload.contentId, payload.language, 'Monster');
});
test('rejects remote requests before accessing Firebase', async () => {
  expect((await POST(request(payload, 'example.com'))).status).toBe(403);
  expect(ref).not.toHaveBeenCalled();
});
test('returns a useful error if the reader restarted and lost the job', async () => {
  expect((await GET(new Request('http://localhost/api/checkpointMedia?jobId=missing'))).status).toBe(404);
});
test('passes the selected formats to the existing job', async () => {
  const job = {id: 'job', ...payload, status: 'select-formats' as const, directory: '/tmp/job', formats: []};
  jest.mocked(getMediaJob).mockReturnValue(job);
  const req = new Request('http://localhost/api/checkpointMedia', {method: 'POST',
    headers: {'Content-Type': 'application/json'}, body: JSON.stringify({jobId: 'job', videoFormatId: '137', audioFormatId: '140'})});
  expect((await POST(req)).status).toBe(202);
  expect(retryMediaJob).toHaveBeenCalledWith(job, '137', '140');
});
