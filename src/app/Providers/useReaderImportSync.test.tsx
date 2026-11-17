/** @jest-environment jsdom */
/** @jest-environment-options {"url":"http://localhost:3000"} */
import {renderHook, act, waitFor} from '@testing-library/react';
import {useReducer} from 'react';
import {useReaderImportSync} from './useReaderImportSync';
import {contentReducer} from '../reducers/content-reducer';
import {normalizeReaderImport} from './reader-import-cache';
const item = {id: 'new', title: 'Practice', content: [{id: 'line', time: 1, reviewData: {due: '2026-11-17'}}], snippets: {s: {id: 's', time: 1}}};
function send(language = 'chinese') {
  window.dispatchEvent(new MessageEvent('message', {source: window, origin: location.origin,
    data: {type: 'll-reader-import', entry: {key: 'pending-key', origin: location.origin, language, content: item}}}));
}
const old = normalizeReaderImport({...item, id: 'old'});
function mount(ready = true) {
  return renderHook(({ready}) => {
    const [content, dispatch] = useReducer(contentReducer, [old]);
    useReaderImportSync({language: 'chinese', ready, content, dispatch});
    return content;
  }, {initialProps: {ready}});
}
beforeEach(() => {localStorage.clear(); jest.spyOn(window, 'postMessage').mockImplementation(() => {});});
afterEach(() => {jest.restoreAllMocks();});
test('updates localStorage and React state and acknowledges only after persistence', async () => {
  localStorage.setItem('chinese-contentState', JSON.stringify([old]));
  const hook = mount();
  act(() => send());
  await waitFor(() => expect(hook.result.current).toHaveLength(2));
  const cache = JSON.parse(localStorage.getItem('chinese-contentState')!);
  expect(cache.map((row: {id: string}) => row.id)).toEqual(['old', 'new']);
  expect(cache[1].snippets).toEqual([{id: 's', time: 1}]);
  expect(cache[1].content[0].reviewData.due).toBe('2026-11-17');
  expect(window.postMessage).toHaveBeenCalledWith({type: 'll-reader-import-applied', key: 'pending-key'}, location.origin);
  act(() => send());
  await waitFor(() => expect(hook.result.current).toHaveLength(2));
});
test('waits for initialization before merging the active language', async () => {
  const hook = mount(false);
  act(() => send());
  expect(localStorage.getItem('chinese-contentState')).toBeNull();
  hook.rerender({ready: true});
  await waitFor(() => expect(hook.result.current).toHaveLength(2));
});
test('loads complete content before creating a missing cache for another language', async () => {
  global.fetch = jest.fn().mockResolvedValue({ok: true, json: async () => ({contentData: [old]})});
  const hook = mount();
  act(() => send('japanese'));
  await waitFor(() => expect(localStorage.getItem('japanese-contentState')).not.toBeNull());
  expect(JSON.parse(localStorage.getItem('japanese-contentState')!).map((row: {id: string}) => row.id)).toEqual(['old', 'new']);
  expect(hook.result.current).toHaveLength(1);
});
test('does not acknowledge or change state when browser storage fails, then accepts a retry', async () => {
  const hook = mount();
  const write = jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {throw new Error('Storage full');});
  act(() => send());
  expect(hook.result.current).toHaveLength(1);
  expect(window.postMessage).not.toHaveBeenCalledWith({type: 'll-reader-import-applied', key: 'pending-key'}, location.origin);
  write.mockRestore();
  act(() => send());
  await waitFor(() => expect(hook.result.current).toHaveLength(2));
});
