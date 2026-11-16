/** Format a YYYY-MM-DD date for display, like "Monday, November 16, 2026". */
export function formatDate(
  /** Date as YYYY-MM-DD. */
  date: string,
  /** How much detail to show. */
  style: "long" | "short" = "long",
) {
  const [year, month, day] = date.split("-").map(Number)
  return new Date(year, month - 1, day).toLocaleDateString("en-US", {
    weekday: style === "long" ? "long" : "short",
    month: style === "long" ? "long" : "short",
    day: "numeric",
    year: style === "long" ? "numeric" : undefined,
  })
}
