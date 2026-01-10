export const mapSentenceIdsToSeconds = ({
  content,
  duration,
}: {
  content: { id: string; time: number }[];
  duration: number;
}): string[] => {
  // Handle invalid durations
  if (!duration || duration <= 0 || !isFinite(duration)) {
    return [];
  }

  const totalSeconds = Math.ceil(duration);
  const result: string[] = new Array(totalSeconds);

  // For each transcript item, fill in the range of seconds it covers
  for (let i = 0; i < content.length; i++) {
    const currentItem = content[i];
    const startTime = currentItem.time;

    // End time is either the start of the next item, or the total duration
    const endTime = i < content.length - 1 ? content[i + 1].time : totalSeconds;

    // Fill in all seconds from start to end with this item's ID
    for (let second = startTime; second < endTime; second++) {
      result[second] = currentItem.id;
    }
  }

  return result;
};
