import { IconCheck } from "@tabler/icons-react"
import { useEffect, useState, type CSSProperties } from "react"
import "./completion-celebration.css"

/** Shared, nonblocking celebration for every game's completion. */
export function CompletionCelebration(
  /** No external configuration. */
  _props: Props,
) {
  const [celebration, setCelebration] = useState(0)
  useEffect(() => {
    const celebrate = () => setCelebration(count => count + 1)
    window.addEventListener("game-completed", celebrate)
    return () => window.removeEventListener("game-completed", celebrate)
  }, [])
  useEffect(() => {
    if (!celebration) return
    const timer = window.setTimeout(() => setCelebration(0), 2200)
    return () => window.clearTimeout(timer)
  }, [celebration])

  if (!celebration) return null
  return (
    <div key={celebration} className="completion-celebration">
      <div role="status" className="completion-celebration-message">
        <IconCheck className="size-5" aria-hidden="true" />
        Puzzle complete!
      </div>
      <div aria-hidden="true" className="completion-confetti">
        {Array.from({ length: 36 }, (_, i) => (
          <span
            key={i}
            style={
              {
                left: `${(i * 37) % 100}%`,
                background: COLORS[i % COLORS.length],
                animationDelay: `${(i % 6) * 60}ms`,
                "--confetti-drift": `${((i * 17) % 160) - 80}px`,
                "--confetti-turn": `${i % 2 ? 540 : -540}deg`,
              } as CSSProperties
            }
          />
        ))}
      </div>
    </div>
  )
}

const COLORS = ["#f4ce55", "#a0c35a", "#8cb7e8", "#bd9be5", "#e89e96"]

type Props = Record<string, never>
