import { useSyncExternalStore } from "react"

/** Whether a CSS media query matches, updating when it changes; false where media queries are unavailable. */
export function useMediaQuery(
  /** The media query, like `(pointer: coarse)`. */
  query: string,
) {
  return useSyncExternalStore(
    onChange => {
      const media = window.matchMedia?.(query)
      media?.addEventListener("change", onChange)
      return () => media?.removeEventListener("change", onChange)
    },
    () => window.matchMedia?.(query).matches ?? false,
  )
}
