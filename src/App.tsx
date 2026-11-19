import { useEffect } from "react"
import { GameScreen } from "./components/GameScreen"
import { Home } from "./components/Home"
import { CompletionCelebration } from "./components/CompletionCelebration"
import { Welcome } from "./components/Welcome"
import { GAMES } from "./constants"
import { hintsRequest } from "./games/spelling-bee/hintsRequest"
import { nytToday } from "./lib/nytToday"
import { readStored } from "./lib/readStored"
import { requestApi } from "./lib/requestApi"
import { usePersistentState } from "./lib/usePersistentState"
import { useRoute } from "./lib/useRoute"

/** Route between the game menu and each game. */
export function App(
  /** No external configuration. */
  _props: Props,
) {
  const { path, params } = useRoute()
  const today = nytToday()
  const date = params.get("date") ?? today
  const game = GAMES.find(g => path === `/${g.id}`)
  const [token, setToken] = usePersistentState("nyt-token", () => "")
  usePrefetchHints(today, token)
  if (!token) return <Welcome onToken={setToken} />
  return (
    <>
      {game ? (
        <GameScreen
          game={game}
          date={date}
          isToday={date === today}
          token={token}
          onToken={setToken}
        />
      ) : (
        <Home date={date} isToday={date === today} />
      )}
      <CompletionCelebration />
    </>
  )
}

/** Have Claude start writing a day's Spelling Bee hints as soon as the app opens, so they're ready when the hints panel is. */
function usePrefetchHints(
  /** Puzzle date as YYYY-MM-DD. */
  date: string,
  /** The NYT-S cookie value saved on this device, if any. */
  token: string,
) {
  useEffect(() => {
    const { path, storageKey } = hintsRequest(date)
    if (!token || readStored(storageKey)) return
    // The hints panel shows any failure when it opens and asks again.
    requestApi(path, token, storageKey).catch(() => {})
  }, [date, token])
}

type Props = Record<string, never>
