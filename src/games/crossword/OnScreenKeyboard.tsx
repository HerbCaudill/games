import { IconBackspace } from "@tabler/icons-react"
import { cn } from "@/lib/utils"

/** A letter keyboard for touch screens, so the system keyboard never covers the grid. */
export function OnScreenKeyboard(
  /** The component props. */
  { onKey, rebus }: Props,
) {
  return (
    <div className="bg-muted grid gap-1.5 p-1.5 pb-[max(0.375rem,env(safe-area-inset-bottom))] pointer-coarse:landscape:w-[45%] pointer-coarse:landscape:shrink-0 pointer-coarse:landscape:self-end pointer-fine:hidden">
      {ROWS.map((row, r) => (
        <div key={r} className="flex justify-center gap-1">
          {row.map(key => (
            <button
              key={key}
              type="button"
              onPointerDown={event => {
                event.preventDefault()
                onKey(key)
              }}
              aria-label={
                key === "Backspace" ? "Delete" : key === "Rebus" && rebus ? "Save rebus" : key
              }
              className={cn(
                "flex h-11 flex-1 items-center justify-center rounded-md bg-card text-base font-medium shadow-sm active:bg-border",
                key.length > 1 && "max-w-16 flex-[1.5] text-xs",
                key === "Rebus" &&
                  rebus &&
                  "bg-(--game-crossword) text-(--game-crossword-foreground)",
              )}
            >
              {key === "Backspace" ? (
                <IconBackspace className="size-5" />
              ) : key === "Rebus" && rebus ? (
                "Done"
              ) : (
                key
              )}
            </button>
          ))}
        </div>
      ))}
    </div>
  )
}

// CONSTANTS

/** Key rows. */
const ROWS = [[..."QWERTYUIOP"], [..."ASDFGHJKL"], ["Rebus", ..."ZXCVBNM", "Backspace"]]

// TYPES

type Props = {
  /** Called with a letter, `Backspace` or `Rebus`. */
  onKey: (key: string) => void
  /** Whether rebus mode is on. */
  rebus: boolean
}
