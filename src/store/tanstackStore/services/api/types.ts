/* Transport Types */

/**
 * Who a request is made as. The stream site has one realm: viewers. Staff
 * sign in to the Studio on theartistry360.com, and their tokens never reach
 * this origin.
 */
export type Realm = "member";

/** Record ids are strings on the wire, whatever the database uses. */
export type Id = string;

/** Paging and totals the API returns beside a list. */
export type Meta = Record<string, unknown> | null;

/** The success body: `{ data }`, or `{ data, meta }` for paged lists. */
export interface Envelope<T> {
  data: T;
  meta: Meta;
}

/** A paged list as `http.list` hands it to a service. */
export interface Page<T> {
  items: T[];
  meta: Meta;
}

/** The failure body from the API's one error middleware. */
export interface ErrorBody {
  error?: {
    code?: string;
    message?: string;
    details?: ErrorDetails;
    requestId?: string;
  };
}

export interface ErrorDetails {
  fieldErrors?: Record<string, string[] | string>;
  [key: string]: unknown;
}

/** What every read accepts, so a query can cancel it. */
export interface RequestOptions {
  signal?: AbortSignal;
}
