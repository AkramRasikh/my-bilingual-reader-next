import type {ReviewDataTypes} from '../types/shared-types';
import {mergeReaderImport, normalizeReaderImport} from './reader-import-cache';
import {contentReducer} from '../reducers/content-reducer';
const incoming = () => normalizeReaderImport({id: 'youtube-id', title: 'Practice', content: [{id: 'line', time: 1, reviewData: {due: 'server-date'}}],
  snippets: {s: {id: 's', time: 1, reviewData: {reps: 1}}}});
test('normalizes UUID-keyed snippets and preserves server scheduling data', () => {
  const item = incoming();
  expect(item.snippets).toEqual([{id: 's', time: 1, reviewData: {reps: 1}}]);
  expect(item.content[0].reviewData).toEqual({due: 'server-date'});
});
test('merges a new import without dropping existing widgets and assigns its index', () => {
  const existing = {...incoming(), id: 'existing', contentIndex: 0};
  const result = mergeReaderImport([existing], incoming());
  expect(result).toHaveLength(2);
  expect(result[0]).toBe(existing);
  expect(result[1].contentIndex).toBe(1);
});
test('replays preserve existing review progress and never duplicate content', () => {
  const existing = incoming();
  existing.snippets![0].reviewData = {reps: 10} as ReviewDataTypes;
  const current = [existing];
  expect(mergeReaderImport(current, incoming())).toBe(current);
  expect(contentReducer(current, {type: 'mergeImportedContent', items: [incoming()]})).toBe(current);
  expect(existing.snippets![0].reviewData?.reps).toBe(10);
});
