import type { IncomingMessage, ServerResponse } from "node:http"
import type { Plugin } from "vite"
import { NYT_TOKEN_HEADER } from "./constants.ts"
import { handleApiRequest, type ApiServices } from "./handleApiRequest.ts"
import { spellingBeeHintWriter } from "./spellingBeeHintWriter.ts"

/** Serve the puzzle API from the Vite dev and preview servers. */
export function nytApiPlugin(
  /** Settings from `.env`. */
  env: Record<string, string>,
): Plugin {
  // The NYT-S cookie value is used when the app doesn't send one.
  const envToken = env.NYT_TOKEN || undefined
  const services: ApiServices = {
    writeHints: env.ANTHROPIC_API_KEY ? spellingBeeHintWriter(env.ANTHROPIC_API_KEY) : undefined,
  }
  const middleware = async (req: IncomingMessage, res: ServerResponse, next: () => void) => {
    const path = req.url?.split("?")[0]
    if (!path?.startsWith("/api/")) return next()
    const header = req.headers[NYT_TOKEN_HEADER]
    const token = (typeof header === "string" ? header : undefined) ?? envToken
    const { status, body } = await handleApiRequest(path, token, services)
    res.statusCode = status
    res.setHeader("Content-Type", "application/json")
    res.end(JSON.stringify(body))
  }
  return {
    name: "nyt-api",
    configureServer: server => {
      if (!envToken)
        server.config.logger.warn("NYT_TOKEN is not set; the app will ask for a token.")
      if (!services.writeHints)
        server.config.logger.warn("ANTHROPIC_API_KEY is not set; Spelling Bee hints are off.")
      server.middlewares.use(middleware)
    },
    configurePreviewServer: server => {
      server.middlewares.use(middleware)
    },
  }
}
