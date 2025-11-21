const getBiggestOverlap = (arr) => {
  // First: try to find the first 100% match
  const full = arr.find((item) => item.percentageOverlap === 100);
  if (full) return full;

  // Otherwise: get the max overlap
  return arr.reduce((max, item) =>
    item.percentageOverlap > max.percentageOverlap ? item : max,
  );
};

export default getBiggestOverlap;
