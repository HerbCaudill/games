import type { IncomingMessage, ServerResponse } from "node:http"
import type { Plugin } from "vite"
import { NYT_TOKEN_HEADER } from "./constants.ts"
import { handleApiRequest } from "./handleApiRequest.ts"

/** Serve the puzzle API from the Vite dev and preview servers. */
export function nytApiPlugin(
  /** The NYT-S cookie value from `.env`, used when the app doesn't send one. */
  envToken: string | undefined,
): Plugin {
  const middleware = async (req: IncomingMessage, res: ServerResponse, next: () => void) => {
    const path = req.url?.split("?")[0]
    if (!path?.startsWith("/api/")) return next()
    const header = req.headers[NYT_TOKEN_HEADER]
    const token = (typeof header === "string" ? header : undefined) ?? envToken
    const { status, body } = await handleApiRequest(path, token)
    res.statusCode = status
    res.setHeader("Content-Type", "application/json")
    res.end(JSON.stringify(body))
  }
  return {
    name: "nyt-api",
    configureServer: server => {
      if (!envToken)
        server.config.logger.warn("NYT_TOKEN is not set; the app will ask for a token.")
      server.middlewares.use(middleware)
    },
    configurePreviewServer: server => {
      server.middlewares.use(middleware)
    },
  }
}
