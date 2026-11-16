import { useSyncExternalStore } from "react"

/** The current path and query, kept in sync with browser navigation. */
export function useRoute() {
  const href = useSyncExternalStore(subscribe, () => location.pathname + location.search)
  const url = new URL(href, location.origin)
  return { path: url.pathname, params: url.searchParams }
}

/** Listen for navigation. */
function subscribe(
  /** Called when the location changes. */
  onChange: () => void,
) {
  window.addEventListener("popstate", onChange)
  return () => window.removeEventListener("popstate", onChange)
}
