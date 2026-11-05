/* Api Base Url And Version */

/**
 * Where the API is comes from the build mode (.env.development, .env.production):
 * empty in development, so calls stay relative and Vite's dev proxy sends them
 * to the local server; https://api.theartistry360.com in a build.
 */
const DEFAULTS: Record<string, string> = {
  VITE_API_BASE_URL: "",
  VITE_API_VERSION: "v1",
  VITE_API_TIMEOUT: "15000",
};

function read(key: string) {
  const value: unknown = import.meta.env?.[key];
  return typeof value === "string" && value.trim() ? value.trim() : DEFAULTS[key];
}

export const apiBaseUrl = read("VITE_API_BASE_URL").replace(/\/+$/, "");
export const apiVersion = read("VITE_API_VERSION");
export const apiTimeout = Number(read("VITE_API_TIMEOUT"));

/** Everything the site and the Studio call sits under this. */
export const apiRoot = `${apiBaseUrl}/api/${apiVersion}`;

/**
 * Mocks stay on until a module is wired to the API. Services opt in one at a
 * time rather than this flag switching all of them at once.
 */
export const useMockApi = (import.meta.env?.VITE_API_MOCKS ?? "true") !== "false";

export function apiUrl(path: string, params?: Record<string, unknown>) {
  const url = `${apiRoot}/${String(path).replace(/^\/+/, "")}`;
  const query = toQuery(params);
  return query ? `${url}?${query}` : url;
}

function toQuery(params?: Record<string, unknown>) {
  if (!params) return "";
  const search = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") continue;
    if (Array.isArray(value)) value.forEach((v) => search.append(key, v));
    else search.append(key, String(value));
  }

  return search.toString();
}
