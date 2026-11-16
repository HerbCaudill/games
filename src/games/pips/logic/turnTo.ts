/** The quarter-turn count nearest to `turns` that faces `direction`, so turning never spins the long way. */
export function turnTo(
  /** The current count of quarter turns clockwise. */
  turns: number,
  /** The direction to face, as an index into DIRECTIONS. */
  direction: number,
) {
  const ahead = (((direction - turns) % 4) + 4) % 4
  return ahead === 3 ? turns - 1 : turns + ahead
}
