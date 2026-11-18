import { NYT_TOKEN_HEADER } from "../../server/constants.ts"
import { handleApiRequest, type ApiServices } from "../../server/handleApiRequest.ts"
import { spellingBeeHintWriter } from "../../server/spellingBeeHintWriter.ts"

/** Serve `/api/<resource>/<YYYY-MM-DD>` in production, using the token the app sends. */
export async function GET(
  /** The incoming request. */
  request: Request,
) {
  const token = request.headers.get(NYT_TOKEN_HEADER) ?? undefined
  const { status, body } = await handleApiRequest(new URL(request.url).pathname, token, services)
  return Response.json(body, { status })
}

// CONSTANTS

/** Services set up from the deployment's environment variables. */
const services: ApiServices = {
  writeHints: process.env.ANTHROPIC_API_KEY
    ? spellingBeeHintWriter(process.env.ANTHROPIC_API_KEY)
    : undefined,
}
