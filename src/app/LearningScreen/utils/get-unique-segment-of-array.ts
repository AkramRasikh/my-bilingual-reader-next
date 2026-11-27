export const getUniqueSegmentOfArray = (
  array: string[],
  startTime: number,
  endTime: number,
): string[] => {
  const firstElInArray = array[Math.floor(startTime)];
  // Clamp so a range ending at (or past) the media duration still finds
  // the last sentence instead of an empty slice.
  const lastElInArray = array[Math.min(Math.ceil(endTime), array.length - 1)];

  const segment = array.slice(
    array.indexOf(firstElInArray),
    array.indexOf(lastElInArray) + 1,
  );

  return Array.from(new Set(segment));
};
