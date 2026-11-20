import type { Cell } from "@/types"

/** Where each domino sits, by domino index; null when it is still in the tray. */
export type Placements = ([Cell, Cell] | null)[]

/** A position in cell units: x across, y down. */
export type Point = [number, number]

/** How a region stands. */
export type RegionStatus = "met" | "broken" | "incomplete"

/** Where the dominoes are and which way they face. */
export type Pieces = {
  /** Where each domino sits on the board. */
  placements: Placements
  /** Quarter turns clockwise for each domino. */
  turns: number[]
  /** Where each loose domino lies, in cell units from the board's corner; null when it is on the board or in its tray slot. */
  spots: (Point | null)[]
}
