import { NYT_TOKEN_HEADER } from "../../server/constants.ts"
import { handleApiRequest } from "../../server/handleApiRequest.ts"

/** Serve `/api/<game>/<YYYY-MM-DD>` in production, using the token the app sends. */
export async function GET(
  /** The incoming request. */
  request: Request,
) {
  const token = request.headers.get(NYT_TOKEN_HEADER) ?? undefined
  const { status, body } = await handleApiRequest(new URL(request.url).pathname, token)
  return Response.json(body, { status })
}
