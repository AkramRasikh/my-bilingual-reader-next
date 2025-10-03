export const makeWordArrayUnique = (array) => {
  if (array.length === 0) {
    return [];
  }
  const setArr = [...new Set(array)];
  if (setArr?.length > 1) {
    return setArr.sort((a, b) => b.length - a.length);
  }
  return setArr;
};
