import type { CrosswordClue } from "@/types"

/** A clue's text, with its formatting when it has any. */
export function ClueText(
  /** The component props. */
  { clue }: Props,
) {
  // The server reduces clue HTML to a short list of formatting tags.
  if (clue.html) return <span dangerouslySetInnerHTML={{ __html: clue.html }} />
  return <span>{clue.text}</span>
}

type Props = {
  /** The clue. */
  clue: CrosswordClue
}
