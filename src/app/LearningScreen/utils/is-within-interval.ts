export const isWithinInterval = (
  item: { time?: number },
  firstTime: number,
  interval: number,
): boolean =>
  item?.time !== undefined &&
  item.time >= firstTime &&
  item.time <= firstTime + interval;
