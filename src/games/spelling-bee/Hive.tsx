/** The seven letter cells, center letter in the middle. */
export function Hive(
  /** The component props. */
  { center, outer, onLetter }: Props,
) {
  const cells = [{ letter: center, x: 0, y: 0, isCenter: true }].concat(
    outer.map((letter, i) => {
      const angle = ((-90 + 60 * i) * Math.PI) / 180
      return { letter, x: SPACING * Math.cos(angle), y: SPACING * Math.sin(angle), isCenter: false }
    }),
  )
  return (
    <svg
      viewBox="-3 -3.05 6 6.1"
      className="w-[min(18rem,80vw,36svh)] select-none"
      role="group"
      aria-label="Letters"
      data-board
    >
      {cells.map(({ letter, x, y, isCenter }) => (
        <g
          key={letter}
          role="button"
          aria-label={letter.toUpperCase()}
          tabIndex={-1}
          className="cursor-pointer transition-transform active:scale-90"
          style={{ transformOrigin: `${x}px ${y}px`, transformBox: "view-box" }}
          onPointerDown={event => {
            event.preventDefault()
            onLetter(letter)
          }}
        >
          <polygon
            points={HEX.map(([hx, hy]) => `${x + hx},${y + hy}`).join(" ")}
            className={isCenter ? "fill-(--game-spelling-bee)" : "fill-muted"}
          />
          <text
            x={x}
            y={y}
            dy="0.36em"
            textAnchor="middle"
            className={isCenter ? "fill-black" : "fill-foreground"}
            style={{ font: `700 ${FONT_SIZE}px var(--font-sans)`, textTransform: "uppercase" }}
          >
            {letter}
          </text>
        </g>
      ))}
    </svg>
  )
}

// CONSTANTS

/** Hexagon radius. */
const RADIUS = 0.98

/** Letter size: capitals 0.4 of the hexagon's radius tall, as in the NYT hive. */
const FONT_SIZE = 0.56

/** Distance between neighboring cell centers, leaving a small gap. */
const SPACING = Math.sqrt(3) * 1.05

/** Corners of a flat-topped hexagon around the origin. */
const HEX = [0, 60, 120, 180, 240, 300].map(deg => {
  const a = (deg * Math.PI) / 180
  return [RADIUS * Math.cos(a), RADIUS * Math.sin(a)]
})

// TYPES

type Props = {
  /** The required letter. */
  center: string
  /** The other six letters, in display order. */
  outer: string[]
  /** Called when a letter is tapped. */
  onLetter: (letter: string) => void
}
