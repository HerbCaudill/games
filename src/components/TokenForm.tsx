import { useState } from "react"
import { Button } from "./ui/button"

/** Ask for the NYT-S cookie value that lets the API fetch subscriber puzzles. */
export function TokenForm(
  /** The component props. */
  { message, onSave }: Props,
) {
  const [value, setValue] = useState("")
  return (
    <form
      className="mx-auto grid max-w-md gap-3 p-6"
      onSubmit={event => {
        event.preventDefault()
        if (value.trim()) onSave(value.trim())
      }}
    >
      {message && <p className="text-destructive">{message}</p>}
      <label htmlFor="nyt-token" className="font-medium">
        NYT token
      </label>
      <p id="nyt-token-help" className="text-muted-foreground text-sm">
        Paste the value of the <code>NYT-S</code> cookie from a browser signed in to nytimes.com.
        You’ll find it in the browser’s developer tools, under the site’s cookies. It stays on this
        device.
      </p>
      <input
        id="nyt-token"
        aria-describedby="nyt-token-help"
        value={value}
        onChange={event => setValue(event.target.value)}
        autoComplete="off"
        autoCapitalize="off"
        spellCheck={false}
        className="bg-background focus-visible:ring-ring/50 rounded-lg border px-3 py-2 font-mono text-base outline-none focus-visible:ring-3"
      />
      <Button type="submit" className="justify-self-start">
        Save
      </Button>
    </form>
  )
}

type Props = {
  /** Why a new token is needed, such as NYT rejecting the saved one. */
  message?: string
  /** Save the entered token. */
  onSave: (token: string) => void
}
