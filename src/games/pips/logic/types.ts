import type { Cell } from "@/types"

/** Where each domino sits, by domino index; null when it is still in the tray. */
export type Placements = ([Cell, Cell] | null)[]

/** A position in cell units: x across, y down. */
export type Point = [number, number]

/** How a region stands. */
export type RegionStatus = "met" | "broken" | "incomplete"
