/* Mock Transport */

/**
 * The site still answers from fixtures. Services import `mockApi` here and
 * will import `http` from `./client` instead, one module at a time, as the
 * backend starts serving each route. Both throw the same ApiError.
 */

export { ApiError } from "./error";

export function mockDelay(ms = 250) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function mockApi(resolver, ms = 250) {
  await mockDelay(ms);
  return resolver();
}
