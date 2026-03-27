const FORBIDDEN_BODY = JSON.stringify({ error: "Forbidden" });

function forbiddenResponse() {
  return new Response(FORBIDDEN_BODY, { status: 403 });
}

export function verifyApiAccess(request: Request): Response | null {
  const internalApiKey = process.env.INTERNAL_API_KEY;
  const providedKey = request.headers.get("x-internal-api-key");

  // Allow server-to-server calls with the configured key.
  if (internalApiKey && providedKey === internalApiKey) {
    return null;
  }

  const requestOrigin = new URL(request.url).origin;
  const origin = request.headers.get("origin");
  const referer = request.headers.get("referer");
  const secFetchSite = request.headers.get("sec-fetch-site");

  if (origin) {
    return origin === requestOrigin ? null : forbiddenResponse();
  }

  if (referer) {
    try {
      return new URL(referer).origin === requestOrigin ? null : forbiddenResponse();
    } catch {
      return forbiddenResponse();
    }
  }

  if (secFetchSite === "same-origin" || secFetchSite === "same-site") {
    return null;
  }

  // Block requests that do not look like same-site browser requests.
  return forbiddenResponse();
}
