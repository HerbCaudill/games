/**
 * Move a solved group's words into the top row, as the NYT board does: each top-row word that
 * wasn't selected takes the place of a selected word below it, and every other word stays put.
 */
export function swapIntoTopRow(
  /** The remaining words, in board order. */
  words: string[],
  /** The four selected words. */
  selected: string[],
) {
  const top = words.slice(0, selected.length)
  const rising = words.filter(word => selected.includes(word))
  const displaced = top.filter(word => !selected.includes(word))
  const rest = words
    .slice(selected.length)
    .map(word => (selected.includes(word) ? displaced.shift()! : word))
  return [...rising, ...rest]
}
