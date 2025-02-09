export function getDaysBetweenDates(a: Date, b: Date) {
  const utcA = a.setHours(0, 0, 0, 0);
  const utcB = b.setHours(0, 0, 0, 0);

  const differenceInMs = Math.abs(utcB - utcA);
  return Math.ceil(differenceInMs / (1000 * 60 * 60 * 24));
}
