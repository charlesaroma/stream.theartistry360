/* Api Error */

/**
 * Mirrors the backend's AppError. Every failed response arrives as
 * `{ error: { code, message, details?, requestId } }` from one error
 * middleware, so the client has exactly one shape to read and `code` is
 * reliable enough to branch on — unlike a message, which is translated.
 */

const CODES = {
  400: "BAD_REQUEST",
  401: "UNAUTHORIZED",
  403: "FORBIDDEN",
  404: "NOT_FOUND",
  409: "CONFLICT",
  422: "UNPROCESSABLE",
  429: "RATE_LIMITED",
};

const MESSAGES = {
  401: "Please sign in to continue.",
  403: "You do not have access to that.",
  404: "We could not find that.",
  429: "Too many attempts. Try again shortly.",
};

export class ApiError extends Error {
  constructor(message, status = 400, { code, details, requestId } = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code ?? codeFor(status);
    this.details = details;
    this.requestId = requestId;
  }

  /** Field errors from the zod validate middleware, keyed by field name. */
  get fieldErrors() {
    return this.details?.fieldErrors ?? null;
  }
}

export function codeFor(status) {
  return CODES[status] ?? "INTERNAL_ERROR";
}

export function apiErrorFromBody(status, body) {
  const error = body?.error ?? {};
  return new ApiError(error.message || messageFor(status), status, error);
}

/** The request never reached the server: offline, DNS, CORS, or a timeout. */
export function networkError(cause) {
  const aborted = cause?.name === "AbortError";
  return new ApiError(
    aborted ? "That took too long. Try again." : "Cannot reach the server.",
    0,
    { code: aborted ? "TIMEOUT" : "NETWORK_ERROR" },
  );
}

function messageFor(status) {
  return MESSAGES[status] ?? "Something went wrong.";
}
