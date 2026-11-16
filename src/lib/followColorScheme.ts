/** Match the app's light or dark theme to the system setting, now and when it changes. */
export function followColorScheme() {
  const query = matchMedia("(prefers-color-scheme: dark)")
  const apply = () => {
    document.documentElement.classList.toggle("dark", query.matches)
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute(
        "content",
        getComputedStyle(document.body).getPropertyValue("--background").trim(),
      )
  }
  apply()
  query.addEventListener("change", apply)
}
