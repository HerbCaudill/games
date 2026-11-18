import { Fragment } from "react"

/** A chain of words with faint dashes between them. */
export function WordChain(
  /** The component props. */
  { words }: Props,
) {
  return (
    <span className="inline-flex flex-wrap items-center gap-1 font-mono tracking-wide">
      {words.map((word, i) => (
        <Fragment key={i}>
          {i > 0 && <span className="font-bold opacity-20">–</span>}
          <span>{word}</span>
        </Fragment>
      ))}
    </span>
  )
}

type Props = {
  /** The words, in order. */
  words: string[]
}
