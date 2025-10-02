export const getTimeDiffSRS = ({dueTimeStamp, timeNow}) => {
  const timeDifference = dueTimeStamp - timeNow; // Difference in milliseconds
  const days = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
  if (days > 0) {
    return `${days} days`;
  }

  const hours = Math.floor(
    (timeDifference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
  );

  if (hours > 0) {
    return `${hours} hrs`;
  }
  const minutes = Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60));

  if (minutes >= 0) {
    return `${minutes} mins`;
  }
  // future
  const timeDifferenceFlipped = timeNow - dueTimeStamp; // Difference in milliseconds
  const daysFlipped = Math.floor(timeDifferenceFlipped / (1000 * 60 * 60 * 24));

  if (daysFlipped > 0) {
    return `Due ${Math.abs(daysFlipped)} days ago`;
  }

  const hoursFlipped = Math.floor(
    (timeDifference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
  );

  if (hoursFlipped > 0) {
    return `Due ${Math.abs(hoursFlipped)} hrs ago`;
  }
  const minutesFlipped = Math.floor(
    (timeDifference % (1000 * 60 * 60)) / (1000 * 60),
  );

  if (minutesFlipped) {
    return `Due ${Math.abs(minutesFlipped)} mins ago`;
  }
};
