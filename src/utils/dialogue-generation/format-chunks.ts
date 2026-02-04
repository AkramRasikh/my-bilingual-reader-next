import { mapKanaToTiming } from './kana-connection';
import { normalizeKana } from './normalize-kana';

export const fixOverlappingEndTimes = (data) => {
  // Filter out entries with null start/end times
  const validData = data.filter(
    (item) => item.start !== null && item.end !== null,
  );

  for (let i = 0; i < validData.length; i++) {
    const current = validData[i];
    let minNextStart = Infinity;

    // Find the smallest start time among all following items
    for (let j = i + 1; j < validData.length; j++) {
      if (validData[j].start < minNextStart) {
        minNextStart = validData[j].start;
      }
    }

    // Only adjust if:
    // 1. There is a following item (`minNextStart` is not Infinity)
    // 2. The current `end` exceeds `minNextStart` (overlap)
    // 3. `minNextStart` is *after* the current `start` (to prevent `end < start`)
    if (
      minNextStart !== Infinity &&
      current.end > minNextStart &&
      minNextStart > current.start
    ) {
      current.end = minNextStart;
    }
  }

  // Return the fixed data (including originally null entries)
  return data.map((item) => {
    if (item.start === null || item.end === null) return item;
    const fixedItem = validData.find(
      (x) =>
        x.chunk === item.chunk &&
        x.reading === item.reading &&
        x.start === item.start,
    );
    return fixedItem || item;
  });
};

export const formatChunksComprehensive = ({ audioQuery, chunks }) => {
  const katakanaTimes = mapKanaToTiming(audioQuery);
  const normalisedChunks = chunks.map((item) => {
    return { ...item, reading: normalizeKana(item.reading) };
  });

  let i = 0;

  let overallMatchedKeys = [];
  let newArr = [];
  let startTimesArr = [];

  normalisedChunks.forEach((chunk) => {
    const reading = chunk.reading;
    let tempKana = '';
    let matchedKanas = [];

    while (i < katakanaTimes.length && tempKana.length < reading.length) {
      tempKana += katakanaTimes[i].kana;
      matchedKanas.push(katakanaTimes[i]);
      if (tempKana === reading) {
        overallMatchedKeys.push(i);
      }
      i++;
    }

    // if it's not a match, keep extending
    while (
      tempKana !== reading &&
      i < katakanaTimes.length &&
      !overallMatchedKeys.includes(i)
    ) {
      tempKana += katakanaTimes[i].kana;
      matchedKanas.push(katakanaTimes[i]);
      overallMatchedKeys.push(i);
      i++;
    }

    const updatedKatakanaTimeArr = katakanaTimes.filter(
      (kataItem) => !startTimesArr.includes(kataItem.start),
    );

    // If we still don't match, roll back the index
    if (tempKana !== reading) {
      // Try to find the match from scratch (fallback)
      for (
        let j = 0;
        j <= updatedKatakanaTimeArr.length - reading.length;
        j++
      ) {
        let temp = '',
          slice = [];
        for (let k = j; k < updatedKatakanaTimeArr.length; k++) {
          temp += updatedKatakanaTimeArr[k].kana;
          slice.push(updatedKatakanaTimeArr[k]);

          if (temp === reading && !overallMatchedKeys.includes(i)) {
            matchedKanas = slice;
            i = k + 1;
            break;
          }
          if (temp.length > reading.length) {
            break;
          }
        }

        if (matchedKanas.length > 0) {
          break;
        }
      }
    }

    const startTime = matchedKanas.length > 0 ? matchedKanas[0].start : null;

    if (startTime) {
      startTimesArr.push(startTime);
    }
    newArr.push({
      ...chunk,
      start: startTime,
      end:
        matchedKanas.length > 0
          ? matchedKanas[matchedKanas.length - 1].end
          : null,
    });
  });

  const fixedChunks = fixOverlappingEndTimes(newArr);

  return fixedChunks;
  console.log('## fixedChunks', fixedChunks);
};
