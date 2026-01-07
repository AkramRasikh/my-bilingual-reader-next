export const getUniqueSegmentOfArray = (
  array: string[],
  startTime: number,
  endTime: number,
): string[] => {
  const firstElInArray = array[Math.floor(startTime)];
  const lastElInArray = array[Math.ceil(endTime)];

  const segment = array.slice(
    array.indexOf(firstElInArray),
    array.indexOf(lastElInArray) + 1,
  );

  return Array.from(new Set(segment));
};
