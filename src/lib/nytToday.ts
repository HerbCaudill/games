/** Today's date in New York, as YYYY-MM-DD, which is how NYT dates its puzzles. */
export function nytToday(
  /** The moment to convert. */
  now = new Date(),
) {
  // The en-CA locale formats dates as YYYY-MM-DD.
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/New_York" }).format(now)
}
