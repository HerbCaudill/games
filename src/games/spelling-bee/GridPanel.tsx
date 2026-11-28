import { useApi } from "@/lib/useApi"
import { cn } from "@/lib/utils"
import type { SpellingBeePuzzle, SpellingBeeStats } from "@/types"
import { twoLetterList } from "./logic/twoLetterList"
import { wordGrid } from "./logic/wordGrid"
import { WordDots } from "./WordDots"

/** Everything that hints without clues: the word grid, the two-letter list and how other players are doing. */
export function GridPanel(
  /** The component props. */
  { puzzle, token, found }: Props,
) {
  const grid = wordGrid(puzzle.answers, found)
  /** Shade a grid cell once for a complete row and once for a complete column, multiplied where they cross. */
  const shade = (rowComplete: boolean, column?: number) => {
    const columnComplete = column !== undefined && grid.completeLengths[column]
    return cn(
      (rowComplete || columnComplete) && "bg-(--spelling-bee-complete)",
      rowComplete && columnComplete && CROSSING_SHADE,
    )
  }
  return (
    <div className="flex flex-col gap-6">
      <section>
        <table className="w-full border-collapse text-sm" aria-label="Word grid">
          <thead>
            <tr>
              <th />
              {grid.lengths.map((length, i) => (
                <th
                  key={length}
                  className={cn("px-1 pb-1 text-left text-xs font-normal", shade(false, i))}
                >
                  {length}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {grid.rows.map(row => (
              <tr key={row.letter} className="border-t">
                <th
                  className={cn(
                    "w-7 py-1.5 pl-1.5 text-left font-semibold uppercase",
                    shade(row.complete),
                  )}
                >
                  {row.letter}
                </th>
                {row.cells.map((cell, i) => (
                  <td
                    key={grid.lengths[i]}
                    className={cn("px-1 py-1.5 align-middle", shade(row.complete, i))}
                    aria-label={
                      cell &&
                      `${row.letter.toUpperCase()}, ${grid.lengths[i]} letters: ${cell.found} of ${cell.total} found`
                    }
                  >
                    {cell && <WordDots count={cell} />}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section>
        <Heading>Two-letter list</Heading>
        <div className="flex flex-col">
          {twoLetterList(puzzle.answers, found).map(group => (
            <div
              key={group.letter}
              className={cn(
                "flex flex-wrap gap-x-4 gap-y-1 border-t px-1.5 py-1.5",
                group.complete && "bg-(--spelling-bee-complete)",
              )}
            >
              {group.prefixes.map(({ prefix, ...count }) => (
                <span
                  key={prefix}
                  className="inline-flex items-center gap-1.5"
                  aria-label={`${prefix.toUpperCase()}: ${count.found} of ${count.total} found`}
                >
                  <span className="text-sm font-semibold uppercase">{prefix}</span>
                  <WordDots count={count} />
                </span>
              ))}
            </div>
          ))}
        </div>
      </section>

      <PlayerStats puzzle={puzzle} token={token} found={found} />
    </div>
  )
}

/** The share of players who found each answer, most found first; unfound answers show only their first letter and length. */
function PlayerStats(
  /** The component props. */
  { puzzle, token, found }: Props,
) {
  const load = useApi<SpellingBeeStats>(`/api/spelling-bee-stats/${puzzle.date}`, token)
  const have = new Set(found)
  return (
    <section>
      <div className="flex items-baseline">
        <Heading>You vs other players</Heading>
        {load.status === "ready" && (
          <span className="text-muted-foreground ml-auto text-xs">
            {load.data.players.toLocaleString()} players
          </span>
        )}
      </div>
      {load.status === "ready" ? (
        <ul>
          {[...puzzle.answers]
            .sort((a, b) => (load.data.found[b] ?? 0) - (load.data.found[a] ?? 0))
            .map(word => {
              const share = load.data.found[word] ?? 0
              const isFound = have.has(word)
              return (
                <li
                  key={word}
                  className="flex h-7 items-center gap-2 border-b text-sm last:border-b-0"
                >
                  <span className={cn("w-24 shrink-0", !isFound && "text-muted-foreground")}>
                    {isFound ? (
                      word[0].toUpperCase() + word.slice(1)
                    ) : (
                      <>
                        <span className="font-semibold">{word[0].toUpperCase()}</span> (
                        {word.length})
                      </>
                    )}
                  </span>
                  <span className="relative flex-1 self-stretch">
                    <span
                      className={cn(
                        "absolute inset-y-1 left-0 rounded-sm",
                        isFound ? "bg-(--game-spelling-bee)" : "bg-muted",
                      )}
                      style={{ width: `${Math.max(share * 100, 0.5)}%` }}
                    />
                    <span className="absolute inset-y-0 right-1 flex items-center font-mono text-[10px]">
                      {Math.round(share * 100)}%
                    </span>
                  </span>
                </li>
              )
            })}
        </ul>
      ) : (
        <p className="text-muted-foreground text-sm">
          {load.status === "error" || load.status === "needs-token"
            ? `Couldn’t load player stats: ${load.message}`
            : "Loading…"}
        </p>
      )}
    </section>
  )
}

/** A small section heading. */
function Heading(
  /** The component props. */
  { children }: { children: string },
) {
  return (
    <h3 className="text-muted-foreground mb-2 text-xs font-semibold tracking-wide uppercase">
      {children}
    </h3>
  )
}

// CONSTANTS

/** A second layer of the complete shade over the first, multiplied with it. */
const CROSSING_SHADE =
  "bg-[linear-gradient(var(--spelling-bee-complete),var(--spelling-bee-complete))] bg-blend-multiply"

// TYPES

type Props = {
  /** The puzzle. */
  puzzle: SpellingBeePuzzle
  /** The NYT-S cookie value saved on this device. */
  token: string
  /** Answers found so far. */
  found: string[]
}
