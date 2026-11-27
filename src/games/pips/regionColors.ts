/** Colors for each constraint region, by region index. */
export const regionColors = {
  /**
   * The region's translucent tint, which also tints the domino halves placed on it. Over the
   * board's dark backdrop it reads dim; over a domino's white face it reads light, so a blank
   * half stands out from an empty cell.
   */
  fill: (i: number) => `color-mix(in oklch, ${hue(i)} 45%, transparent)`,
  /** The region's outline color. */
  stroke: (i: number) => `oklch(from ${hue(i)} calc(l - 0.16) calc(c + 0.04) h)`,
  /** The pip color for a domino half on the region. */
  ink: (i: number) => `color-mix(in oklch, var(--foreground) 70%, ${regionColors.stroke(i)})`,
}

/** A region's base hue. */
function hue(
  /** Region index. */
  i: number,
) {
  return REGION_COLORS[i % REGION_COLORS.length]
}

// CONSTANTS

/** Region hues, cycled by region. */
const REGION_COLORS = [
  "#e8956b",
  "#6fb59a",
  "#8ea5dc",
  "#d58fc0",
  "#e2c25c",
  "#7fc3d6",
  "#b39ae0",
  "#a9c46a",
]
