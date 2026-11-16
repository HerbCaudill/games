/** Format seconds as m:ss, or h:mm:ss past an hour. */
export function formatDuration(
  /** Elapsed seconds. */
  seconds: number,
) {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = String(seconds % 60).padStart(2, "0")
  return h ? `${h}:${String(m).padStart(2, "0")}:${s}` : `${m}:${s}`
}
