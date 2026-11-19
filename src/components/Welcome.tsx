import { TokenForm } from "./TokenForm"

/** The first screen on a new device: what the app is, and the NYT token it needs to get puzzles. */
export function Welcome(
  /** The component props. */
  { onToken }: Props,
) {
  return (
    <div className="app-shell">
      {/* No visible header, but iOS only keeps the status bar clear of blur above an opaque sticky one. */}
      <header className="app-header app-header-bare" />
      <main className="app-content">
        <div className="mx-auto flex max-w-md flex-col gap-2 px-6 pt-8">
          <img src="/icon.svg" alt="" className="size-14 rounded-xl" />
          <h1 className="text-2xl font-semibold">Games</h1>
          <p className="text-muted-foreground">
            The NYT’s daily Crossword, Pips, Spelling Bee, Connections and Letter Boxed, played with
            your own NYT Games subscription.
          </p>
        </div>
        <TokenForm onSave={onToken} />
      </main>
    </div>
  )
}

type Props = {
  /** Save the entered token. */
  onToken: (token: string) => void
}
