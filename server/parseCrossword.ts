import type { CrosswordCell, CrosswordClue, CrosswordPuzzle } from "../src/types.ts"

/** Convert the NYT v6 crossword feed into a puzzle. */
export function parseCrossword(
  /** The parsed JSON response. */
  raw: RawCrossword,
): CrosswordPuzzle {
  const body = raw.body[0]
  return {
    id: raw.id,
    date: raw.publicationDate,
    title: raw.title || undefined,
    constructors: raw.constructors ?? [],
    editor: raw.editor ?? "",
    width: body.dimensions.width,
    height: body.dimensions.height,
    cells: body.cells.map(parseCell),
    clues: body.clues.map((clue, id): CrosswordClue => ({
      id,
      direction: clue.direction === "Down" ? "down" : "across",
      label: clue.label,
      text: clue.text.map(t => t.plain).join(" "),
      html: clue.text.some(t => t.formatted)
        ? clue.text.map(t => (t.formatted ? cleanHtml(t.formatted) : escapeHtml(t.plain))).join(" ")
        : undefined,
      cells: clue.cells,
      related: [...new Set(clue.relatives ?? [])],
    })),
  }
}

/** Convert one cell; cells without an answer are black squares. */
function parseCell(
  /** The raw cell. */
  cell: RawCell,
): CrosswordCell | null {
  if (!cell.answer) return null
  return {
    answer: cell.answer.toUpperCase(),
    altAnswers: (cell.moreAnswers?.valid ?? []).map(a => a.toUpperCase()),
    label: cell.label,
    circled: cell.type === CIRCLED,
    shaded: cell.type === SHADED,
  }
}

/** Keep only simple formatting tags, without attributes, so clue HTML is safe to render. */
function cleanHtml(
  /** Clue HTML from NYT. */
  html: string,
) {
  return html.replace(/<(\/?)([a-z0-9]+)[^>]*>/gi, (_, slash: string, tag: string) =>
    ALLOWED_TAGS.has(tag.toLowerCase()) ? `<${slash}${tag.toLowerCase()}>` : "",
  )
}

/** Escape plain clue text so it can sit beside formatted fragments. */
function escapeHtml(
  /** Plain text. */
  text: string,
) {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
}

// CONSTANTS

/** Formatting tags allowed in clue HTML. */
const ALLOWED_TAGS = new Set(["i", "b", "em", "strong", "sub", "sup", "s", "u", "br"])

/** NYT cell type for a circled square. */
const CIRCLED = 2

/** NYT cell type for a shaded square. */
const SHADED = 3

// TYPES

/** The parts of the NYT crossword feed this app reads. */
export type RawCrossword = {
  id: number
  publicationDate: string
  title?: string
  constructors?: string[]
  editor?: string
  body: {
    dimensions: { width: number; height: number }
    cells: RawCell[]
    clues: {
      cells: number[]
      direction: string
      label: string
      text: { plain: string; formatted?: string }[]
      relatives?: number[]
    }[]
  }[]
}

/** A raw crossword cell. */
type RawCell = {
  answer?: string
  label?: string
  type?: number
  moreAnswers?: { valid?: string[] }
}
