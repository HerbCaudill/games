import { useState } from "react"
import { IconBackspace } from "@tabler/icons-react"
import { cn } from "@/lib/utils"

/** A letter keyboard for touch screens, so the system keyboard never covers the grid. */
export function OnScreenKeyboard(
  /** The component props. */
  { onKey, rebus }: Props,
) {
  const [pressed, setPressed] = useState<Pressed>()
  const release = () => setPressed(undefined)

  return (
    <div className="bg-muted grid gap-2 p-1.5 pb-[max(3rem,env(safe-area-inset-bottom))]">
      {ROWS.map((row, r) => (
        <div key={r} className="flex justify-center gap-1">
          {row.map((key, k) => (
            <button
              key={key}
              type="button"
              onPointerDown={event => {
                event.preventDefault()
                onKey(key)
                if (key.length > 1) return
                const { width, height } = event.currentTarget.getBoundingClientRect()
                const align = k === 0 ? "left" : k === row.length - 1 ? "right" : "center"
                setPressed({ letter: key, width, height, align })
              }}
              onPointerUp={release}
              onPointerCancel={release}
              onPointerLeave={release}
              aria-label={
                key === "Backspace" ? "Delete" : key === "Rebus" && rebus ? "Save rebus" : key
              }
              className={cn(
                "relative flex h-13 flex-1 items-center justify-center rounded-md bg-card text-base font-medium shadow-sm active:bg-border",
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
              {pressed?.letter === key && <KeyPopout {...pressed} />}
            </button>
          ))}
        </div>
      ))}
    </div>
  )
}

/** An enlarged copy of a held letter key that rises above the finger, as on the iOS keyboard. */
function KeyPopout(
  /** The pressed key and its size. */
  { letter, width, height, align }: Pressed,
) {
  // Keys at the ends of a row widen inward only, so the bubble stays on screen.
  const spread = width * SPREAD
  const left = align === "left" ? 0 : align === "right" ? 2 * spread : spread
  const right = 2 * spread - left
  const outer = width + left + right
  const head = height * HEAD
  const neck = height * NECK
  const total = head + height
  const r = RADIUS

  const path = [
    `M ${r} 0 H ${outer - r} Q ${outer} 0 ${outer} ${r} V ${head - neck / 2}`,
    `C ${outer} ${head} ${outer - right} ${head - neck / 2} ${outer - right} ${head + neck / 2}`,
    `V ${total - r} Q ${outer - right} ${total} ${outer - right - r} ${total} H ${left + r}`,
    `Q ${left} ${total} ${left} ${total - r} V ${head + neck / 2}`,
    `C ${left} ${head - neck / 2} 0 ${head} 0 ${head - neck / 2} V ${r} Q 0 0 ${r} 0 Z`,
  ].join(" ")

  return (
    <span
      data-testid="key-popout"
      aria-hidden
      className="pointer-events-none absolute bottom-0 z-10"
      style={{ left: -left, width: outer, height: total }}
    >
      <svg
        className="absolute inset-0 size-full overflow-visible drop-shadow-[0_1px_2px_rgb(0_0_0/0.3)]"
        viewBox={`0 0 ${outer} ${total}`}
      >
        <path d={path} className="fill-card" />
      </svg>
      <span
        className="absolute inset-x-0 top-0 flex items-center justify-center text-4xl font-normal"
        style={{ height: head }}
      >
        {letter}
      </span>
    </span>
  )
}

// CONSTANTS

/** Key rows. */
const ROWS = [[..."QWERTYUIOP"], [..."ASDFGHJKL"], ["Rebus", ..."ZXCVBNM", "Backspace"]]

/** How far the popout widens past each side of the key, as a share of the key's width. */
const SPREAD = 0.2

/** How far the popout rises above the key, as a share of the key's height. */
const HEAD = 0.95

/** The height of the curve joining the popout's head to its stem, as a share of the key's height. */
const NECK = 0.3

/** The popout's corner radius in pixels. */
const RADIUS = 7

// TYPES

/** The key being held down and its size. */
type Pressed = {
  /** The letter. */
  letter: string
  /** The key's width in pixels. */
  width: number
  /** The key's height in pixels. */
  height: number
  /** Which way the popout widens: both sides, or inward from the left or right end of a row. */
  align: "left" | "center" | "right"
}

type Props = {
  /** Called with a letter, `Backspace` or `Rebus`. */
  onKey: (key: string) => void
  /** Whether rebus mode is on. */
  rebus: boolean
}
