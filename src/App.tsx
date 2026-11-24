import { GameScreen } from "./components/GameScreen"
import { Home } from "./components/Home"
import { CompletionCelebration } from "./components/CompletionCelebration"
import { Welcome } from "./components/Welcome"
import { GAMES } from "./constants"
import { usePrefetchHints } from "./games/spelling-bee/usePrefetchHints"
import { nytToday } from "./lib/nytToday"
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
  usePrefetchHints(token)
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

type Props = Record<string, never>
