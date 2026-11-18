import Anthropic from "@anthropic-ai/sdk"
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod"
import { z } from "zod"
import type { HintWriter } from "./handleApiRequest.ts"

/** Write Spelling Bee hints with Claude, in the style of late-week crossword clues. */
export function spellingBeeHintWriter(
  /** Anthropic API key. */
  apiKey: string,
): HintWriter {
  const client = new Anthropic({ apiKey })
  return async (answers, pangrams) => {
    const response = await client.messages.parse({
      // Spelling Bee Buddy's choice, which these clues were tuned on.
      model: "claude-sonnet-5",
      max_tokens: 16000,
      output_config: { effort: "low", format: zodOutputFormat(HINTS) },
      messages: [{ role: "user", content: hintPrompt(answers, pangrams) }],
    })
    if (response.stop_reason === "refusal") throw new Error("Claude declined to write hints.")
    if (!response.parsed_output) throw new Error("Claude's hints couldn't be read.")
    const written = new Map(response.parsed_output.hints.map(h => [h.word.toLowerCase(), h.clue]))
    // Fall back to the length for any word Claude skipped, so every answer has something.
    return Object.fromEntries(
      answers.map(word => [word, written.get(word) ?? `${word.length}-letter word`]),
    )
  }
}

/** The prompt, refined in Spelling Bee Buddy. */
function hintPrompt(
  /** Every answer. */
  answers: string[],
  /** Answers that use all seven letters. */
  pangrams: string[],
) {
  const words = answers.map(w => `${w}${pangrams.includes(w) ? " (pangram)" : ""}`).join("\n")
  return `Write hints for an NYT Spelling Bee companion in the style of polished Friday or Saturday American crossword clues. Do not write cryptic clues. Keep each clue concise, natural, accurate, and fair, but make the solver take one mental step.

Treat every entry as one standalone lowercase dictionary word exactly as spelled. Never split it into a phrase, reinterpret it as initials, or use a proper-name reading. If its spelling resembles a more familiar phrase or name, ignore that resemblance and clue the standalone word. For example, \`DOIT\` means an old Dutch coin; it is not “do it.” An optional “(pangram)” label is only metadata.

Match the answer's grammar exactly. The answer must be able to substitute for the clue without changing part of speech, number, tense, or degree. For example, \`TANKED\` could be clued as "Drunk" (an adjective), but not “Got drunk” (a verb phrase). Or, using another sense of the word, \`TANKED\` could also be clued as "Went downhill" (a verb phrase) but not "Downhill" (an adjective).

Clue familiar words obliquely; do not give a dictionary definition or close synonym. Use an exact but indirect route such as a familiar situation, characteristic example, secondary sense, idiom, or light wordplay. Use misdirection only when it remains natural and defensible. Clue an obscure or technical word more directly so it stays solvable.

Do not use the answer or a form of it in the clue. Avoid strained metaphors, vague associations, approximate facts, and wordplay that depends on splitting the answer into multiple words. Silently check the standalone word sense, grammatical substitution, accuracy, phrasing, difficulty, and fairness of every clue before responding.

Write one clue for each of these words, using each word exactly as listed:
${words}`
}

// CONSTANTS

/** The shape Claude answers in. */
const HINTS = z.object({
  hints: z.array(z.object({ word: z.string(), clue: z.string() })),
})
