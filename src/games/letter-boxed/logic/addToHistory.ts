/** Add a chain to the history, dropping any earlier chain it continues and skipping it if a recorded chain already continues it. */
export function addToHistory(
  /** Chains so far. */
  history: string[][],
  /** The chain to add. */
  words: string[],
) {
  if (history.some(chain => startsWith(chain, words))) return history
  return [...history.filter(chain => !startsWith(words, chain)), words]
}

/** Whether a chain begins with every word of another, in order. */
function startsWith(
  /** The longer chain. */
  chain: string[],
  /** The chain that might begin it. */
  start: string[],
) {
  return start.length <= chain.length && start.every((word, i) => chain[i] === word)
}
