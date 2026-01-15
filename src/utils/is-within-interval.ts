export type TimedItem = { time?: number };

export const isWithinInterval = (
  item: TimedItem,
  firstTime: number,
  interval: number,
): boolean =>
  item?.time !== undefined &&
  item.time >= firstTime &&
  item.time <= firstTime + interval;

export default isWithinInterval;
