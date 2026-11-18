import { cn } from "@/lib/utils"

/**
 * Feedback below the word: a word or error message rises and fades away, while a finished chain's
 * message stays, with a little wiggle when it first appears.
 */
export function Message(
  /** The component props. */
  { message }: Props,
) {
  return (
    <div className="relative flex h-10 items-center justify-center">
      {message && (
        <div
          key={message.id}
          role="status"
          className={cn(
            "absolute rounded border border-black px-4 py-1 text-center text-sm tracking-wide whitespace-nowrap",
            message.kind === "error" ? "bg-black text-white" : "bg-white text-black",
            message.kind === "solution"
              ? message.isNew && "letter-boxed-celebrate"
              : "letter-boxed-rise",
          )}
        >
          {message.kind === "solution" ? (
            <>
              {message.words === 2 && <span className="px-2 text-xl">🎉</span>}
              You found a solution in <strong className="font-black">{message.words}</strong> words!
            </>
          ) : (
            message.text
          )}
        </div>
      )}
    </div>
  )
}

// TYPES

/** What the message area shows. */
export type LetterBoxedMessage = { id: number } & (
  | {
      /** An accepted word or a rejected one. */
      kind: "word" | "error"
      /** What it says. */
      text: string
    }
  | {
      /** A chain that uses every letter. */
      kind: "solution"
      /** How many words it took. */
      words: number
      /** Whether it was found just now, rather than restored. */
      isNew: boolean
    }
)

type Props = {
  /** The message, if any. */
  message?: LetterBoxedMessage
}
