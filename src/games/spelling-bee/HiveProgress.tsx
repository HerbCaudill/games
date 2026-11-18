/** A hive of seven cells that light up as the rank climbs, all lit from Amazing on. */
export function HiveProgress(
  /** The component props. */
  { rank, className }: Props,
) {
  return (
    <svg viewBox="0 0 88 88" className={className} aria-hidden="true">
      {CELLS.map(([x, y], i) => (
        <polygon
          key={i}
          points={hexagon(x, y)}
          fill={i < rank ? "var(--spelling-bee-hive)" : WELL}
        />
      ))}
    </svg>
  )
}

/** Corner points of a flat-topped hexagon. */
function hexagon(
  /** Center x. */
  x: number,
  /** Center y. */
  y: number,
) {
  return [0, 1, 2, 3, 4, 5]
    .map(i => {
      const angle = (i * Math.PI) / 3
      return `${x + RADIUS * Math.cos(angle)},${y + RADIUS * Math.sin(angle)}`
    })
    .join(" ")
}

// CONSTANTS

/** Cell size, center to corner. */
const RADIUS = 15.5

/** Distance between neighboring cell centers, leaving a small gap. */
const STEP = RADIUS * Math.sqrt(3) + 1.5

/** Cell centers in the order they light up: the middle, then around it clockwise from the bottom. */
const CELLS = [0, 90, 150, 210, 270, 330, 30].map((degrees, i) => {
  const distance = i === 0 ? 0 : STEP
  const angle = (degrees * Math.PI) / 180
  return [44 + distance * Math.cos(angle), 44 + distance * Math.sin(angle)] as const
})

/** Fill for a cell not yet lit. */
const WELL = "rgb(255 255 255 / 0.8)"

// TYPES

type Props = {
  /** Index of the rank reached, from 0 (Beginner) to 9 (Queen Bee). */
  rank: number
  /** Size classes. */
  className?: string
}
