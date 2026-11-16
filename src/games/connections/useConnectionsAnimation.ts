import { useEffect, useRef } from "react"

/** Play a short board animation, skipping motion when requested and cleaning up on exit. */
export function useConnectionsAnimation() {
  const active = useRef<Animation[]>([])
  useEffect(() => () => active.current.forEach(animation => animation.cancel()), [])

  return async (steps: AnimationStep[]) => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    const animations = steps.map(({ element, keyframes, options }) =>
      element.animate(keyframes, options),
    )
    active.current.push(...animations)
    await Promise.all(animations.map(animation => animation.finished.catch(() => undefined)))
    animations.forEach(animation => animation.cancel())
    active.current = active.current.filter(animation => !animations.includes(animation))
  }
}

/** One element's part of a board animation. */
type AnimationStep = {
  /** The tile or band to move. */
  element: HTMLElement
  /** Its visual path. */
  keyframes: Keyframe[]
  /** Playback duration and timing. */
  options: KeyframeAnimationOptions
}
