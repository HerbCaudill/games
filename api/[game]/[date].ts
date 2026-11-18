import { NYT_TOKEN_HEADER } from "../../server/constants.ts"
import { handleApiRequest, type ApiServices } from "../../server/handleApiRequest.ts"
import { spellingBeeHintWriter } from "../../server/spellingBeeHintWriter.ts"

/** Serve `/api/<resource>/<YYYY-MM-DD>` in production, using the token the app sends. */
export async function GET(
  /** The incoming request. */
  request: Request,
) {
  return respond(request)
}

/** Save progress to `/api/<game>-progress/<YYYY-MM-DD>` in production. */
export async function PUT(
  /** The incoming request. */
  request: Request,
) {
  return respond(request, await request.json().catch(() => undefined))
}

/** Answer a request with the shared API handler. */
async function respond(
  /** The incoming request. */
  request: Request,
  /** The parsed JSON body, if any. */
  body?: unknown,
) {
  const token = request.headers.get(NYT_TOKEN_HEADER) ?? undefined
  const { pathname } = new URL(request.url)
  const { method } = request
  const { status, body: response } = await handleApiRequest(pathname, token, services, {
    method,
    body,
  })
  return Response.json(response, { status })
}

// CONSTANTS

/** Services set up from the deployment's environment variables. */
const services: ApiServices = {
  writeHints: process.env.ANTHROPIC_API_KEY
    ? spellingBeeHintWriter(process.env.ANTHROPIC_API_KEY)
    : undefined,
}
