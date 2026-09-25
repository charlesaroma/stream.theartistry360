/* Http Client */
import { apiTimeout, apiUrl } from "./config";
import { apiErrorFromBody, networkError } from "./error";
import { accessToken, clearAccessToken } from "./tokens";

/**
 * Every call names its realm, so a Studio token never rides along on a
 * member request.
 */
async function request(method, path, options = {}) {
  const { body, params, realm = "member", headers, signal } = options;
  const control = abortAfter(apiTimeout, signal);
  let response;

  try {
    response = await fetch(apiUrl(path, params), {
      method,
      signal: control.signal,
      credentials: "include",
      headers: buildHeaders({ body, headers, realm }),
      body: serialize(body),
    });
  } catch (cause) {
    throw networkError(cause);
  } finally {
    control.done();
  }

  // A rejected token is dropped; the auth context hears it and signs out.
  if (response.status === 401 && accessToken(realm)) clearAccessToken(realm);

  return unwrap(response);
}

function buildHeaders({ body, headers, realm }) {
  const token = accessToken(realm);
  return {
    Accept: "application/json",
    // FormData sets its own multipart boundary; naming a type here breaks it.
    ...(body && !(body instanceof FormData) ? { "Content-Type": "application/json" } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...headers,
  };
}

function serialize(body) {
  if (body === undefined || body === null) return undefined;
  return body instanceof FormData ? body : JSON.stringify(body);
}

/** The API answers `{ data, meta? }` on success and `{ error }` on failure. */
async function unwrap(response) {
  if (response.status === 204) return { data: null, meta: null };

  const body = await response.json().catch(() => null);
  if (!response.ok) throw apiErrorFromBody(response.status, body);

  if (body && typeof body === "object" && "data" in body) {
    return { data: body.data, meta: body.meta ?? null };
  }
  return { data: body, meta: null };
}

function abortAfter(ms, signal) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  signal?.addEventListener("abort", () => controller.abort(), { once: true });

  return { signal: controller.signal, done: () => clearTimeout(timer) };
}

export const http = {
  get: async (path, options) => (await request("GET", path, options)).data,
  post: async (path, body, options) => (await request("POST", path, { ...options, body })).data,
  patch: async (path, body, options) => (await request("PATCH", path, { ...options, body })).data,
  put: async (path, body, options) => (await request("PUT", path, { ...options, body })).data,
  del: async (path, options) => (await request("DELETE", path, options)).data,

  /** A paged collection: `{ items, meta }` rather than a bare array. */
  list: async (path, options) => {
    const { data, meta } = await request("GET", path, options);
    return { items: data ?? [], meta };
  },
};
