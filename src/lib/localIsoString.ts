/** A moment as ISO 8601 in this device's time zone, with its UTC offset, such as `2026-11-17T10:00:24+01:00`. */
export function localIsoString(
  /** The moment. */
  moment: Date,
) {
  const pad = (n: number) => String(Math.trunc(Math.abs(n))).padStart(2, "0")
  const offset = -moment.getTimezoneOffset()
  const sign = offset >= 0 ? "+" : "-"
  return (
    `${moment.getFullYear()}-${pad(moment.getMonth() + 1)}-${pad(moment.getDate())}` +
    `T${pad(moment.getHours())}:${pad(moment.getMinutes())}:${pad(moment.getSeconds())}` +
    `${sign}${pad(offset / 60)}:${pad(offset % 60)}`
  )
}
