/** Go to a path within the app. */
export function navigate(
  /** Path and optional query. */
  to: string,
) {
  history.pushState(null, "", to)
  window.dispatchEvent(new PopStateEvent("popstate"))
}
