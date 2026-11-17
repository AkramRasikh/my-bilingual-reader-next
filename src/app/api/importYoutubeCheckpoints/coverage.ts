import {getSnippetTimeRange} from '../../LearningScreen/learning-screen-review-time-range';

type Sentence = {id: string; time: number; reviewData?: unknown};
type ReviewedSnippet = {time: number; isContracted?: boolean; reviewData?: {due?: unknown}};

// Use the union of review-enabled snippet windows: repeated/overlapping
// checkpoints must never inflate sentence coverage.
export function coveredSentenceIds(sentences: Sentence[], snippets: ReviewedSnippet[], mediaDuration: number | null) {
  const windows = snippets.filter(snippet => snippet.reviewData?.due && Number.isFinite(snippet.time))
    .map(snippet => getSnippetTimeRange({time: snippet.time, isContracted: !!snippet.isContracted})).sort((a, b) => a.startTime - b.startTime);
  const merged: {startTime: number; endTime: number}[] = [];
  for (const window of windows) {
    const previous = merged[merged.length - 1];
    if (previous && window.startTime <= previous.endTime) previous.endTime = Math.max(previous.endTime, window.endTime);
    else merged.push({...window});
  }
  const ids: string[] = [];
  let firstWindow = 0;
  for (let index = 0; index < sentences.length; index++) {
    const sentence = sentences[index];
    const end = sentences[index + 1]?.time ?? mediaDuration;
    if (sentence.reviewData || end === null || !Number.isFinite(end) || end <= sentence.time) continue;
    while (firstWindow < merged.length && merged[firstWindow].endTime <= sentence.time) firstWindow++;
    let covered = 0;
    for (let j = firstWindow; j < merged.length && merged[j].startTime < end; j++) {
      covered += Math.max(0, Math.min(end, merged[j].endTime) - Math.max(sentence.time, merged[j].startTime));
    }
    if (covered > 0 && covered >= (end - sentence.time) / 2) ids.push(sentence.id);
  }
  return ids;
}
