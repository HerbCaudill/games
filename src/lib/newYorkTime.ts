/** The moment an hour on a date comes around in New York, in milliseconds since 1970. */
export function newYorkTime(
  /** Date as YYYY-MM-DD. */
  date: string,
  /** Hour of the day in New York, from 0 to 23. */
  hour: number,
) {
  const [year, month, day] = date.split("-").map(Number)
  // New York is four hours behind UTC on daylight saving time and five otherwise; take whichever reads back as the hour asked for.
  const [summer, winter] = [4, 5].map(offset => Date.UTC(year, month - 1, day, hour + offset))
  return newYorkHour(summer) === hour ? summer : winter
}

/** The hour in New York at a moment. */
function newYorkHour(
  /** Milliseconds since 1970. */
  time: number,
) {
  const format = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    hour: "numeric",
    hourCycle: "h23",
  })
  return Number(format.format(time))
}
