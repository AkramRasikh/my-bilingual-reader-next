/** @jest-environment node */
import {coveredSentenceIds} from './coverage';
const sentence = (id: string, time: number) => ({id, time});
const snippet = (time: number, isContracted = false) => ({time, isContracted, reviewData: {due: '2026-11-17T12:00:00Z'}});

test('includes exactly 50 percent coverage but excludes less than half', () => {
  expect(coveredSentenceIds([sentence('a', 0), sentence('b', 6)], [snippet(1.5)], null)).toEqual(['a']);
  expect(coveredSentenceIds([sentence('a', 0), sentence('b', 6.1)], [snippet(1.5)], null)).toEqual([]);
});
test('combines disjoint snippet windows without double counting duplicate or overlapping windows', () => {
  const lines = [sentence('a', 0), sentence('b', 10)];
  expect(coveredSentenceIds(lines, [snippet(1.5), snippet(8.5)], null)).toEqual(['a']);
  expect(coveredSentenceIds(lines, [snippet(1.5), snippet(1.5), snippet(2)], null)).toEqual([]);
});
test('only snippets with reviewData.due contribute, including pre-snippets', () => {
  const lines = [sentence('a', 0), sentence('b', 3)];
  expect(coveredSentenceIds(lines, [{time: 1.5}, {time: 1.5, reviewData: {}}], null)).toEqual([]);
  expect(coveredSentenceIds(lines, [snippet(1.5)], null)).toEqual(['a']);
});
test('uses symmetric contracted windows and video duration for the last sentence', () => {
  const lines = [sentence('last', 10)];
  expect(coveredSentenceIds(lines, [snippet(11.5, true)], 13)).toEqual(['last']);
  expect(coveredSentenceIds(lines, [snippet(11.5, true)], null)).toEqual([]);
  expect(coveredSentenceIds(lines, [snippet(11.5, true)], 14)).toEqual([]);
});
test('skips existing sentence review data and zero-length sentence intervals', () => {
  expect(coveredSentenceIds([{...sentence('existing', 0), reviewData: {reps: 10}}, sentence('zero', 3), sentence('tail', 3)],
    [snippet(1.5), snippet(4.5)], 6)).toEqual(['tail']);
});
