import { useEffect, useRef } from "react"

/**
 * Play short board animations, skipping motion when requested. Finished animations hold their end
 * state until `release`, so the caller can commit the matching React state first without a flicker.
 */
export function useConnectionsAnimation() {
  const active = useRef<Animation[]>([])
  const mounted = useRef(true)
  const release = () => {
    active.current.forEach(animation => animation.cancel())
    active.current = []
  }
  useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
      release()
    }
  }, [])

  /** Run the steps together; resolves false if the board went away meanwhile. */
  const animate = async (steps: AnimationStep[]) => {
    if (!mounted.current) return false
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return true
    const animations = steps.map(({ element, keyframes, options }) =>
      element.animate(keyframes, options),
    )
    active.current.push(...animations)
    await Promise.all(animations.map(animation => animation.finished.catch(() => undefined)))
    return mounted.current
  }
  return { animate, release }
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
