/** Group clues by their answers' first two letters, shortest answers first, marking found ones. */
export function hintGroups(
  /** A clue for each answer, keyed by the lowercase word. */
  hints: Record<string, string>,
  /** Answers found so far. */
  found: string[],
) {
  const have = new Set(found)
  const words = Object.keys(hints).sort((a, b) => a.length - b.length || a.localeCompare(b))
  const prefixes = [...new Set(words.map(w => w.slice(0, 2)))].sort()
  return prefixes.map(prefix => {
    const group = words
      .filter(w => w.startsWith(prefix))
      .map(word => ({ word, clue: hints[word], found: have.has(word) }))
    return { prefix, found: group.filter(h => h.found).length, hints: group }
  })
}
