import type { IncomingHttpHeaders } from 'http';

import type { ParsedQs } from 'qs';

/** Minimal type matching Express's ParamsDictionary */
export type ParamsDictionary = Record<string, string>;

/** Context type for middleware/app-specific data */
export type RequestContext = Record<string, unknown>;

/**
 * Generic, lightweight, framework-agnostic HTTP request.
 */
export class ZistrRequest<
  Body = unknown,
  Query extends ParsedQs = ParsedQs,
  Params extends ParamsDictionary = ParamsDictionary,
  Context extends RequestContext = RequestContext,
> {
  /** HTTP method (e.g. GET, POST, PUT) */
  method: string;

  /** Full URL path including query string (e.g. /users/1?active=true) */
  url: string;

  /** Parsed pathname-only route (e.g. /users/1) */
  path: string;

  /** HTTP protocol (e.g. 'http', 'https') */
  protocol: string;

  /** Remote client IP address */
  ip?: string;

  /** Parsed HTTP request headers */
  headers: IncomingHttpHeaders;

  /** Parsed request body */
  body: Body;

  /** Query string parameters: ?key=value */
  query: Query;

  /** Route parameters extracted from the path */
  params: Params;

  /** Application-specific request context */
  context: Context;

  /** The original URL before any router or framework modifications */
  originalUrl: string;

  /** HTTP version (e.g., '1.1', '2.0') */
  httpVersion: string;

  /** Parsed cookies (requires upstream cookie parsing middleware) */
  cookies: Record<string, string>;

  /** Parsed and validated signed cookies */
  signedCookies: Record<string, string>;

  constructor(init: {
    method: string;
    url: string;
    path: string;
    protocol: string;
    originalUrl: string;
    httpVersion: string;
    headers?: IncomingHttpHeaders;
    ip?: string;
    body?: Body;
    query?: Query;
    params?: Params;
    context?: Context;
    cookies?: Record<string, string>;
    signedCookies?: Record<string, string>;
  }) {
    this.method = init.method;
    this.url = init.url;
    this.path = init.path;
    this.protocol = init.protocol;
    this.ip = init.ip;

    // Normalize headers to lowercase keys
    this.headers = {};
    if (init.headers) {
      Object.entries(init.headers).forEach(([key, value]) => {
        this.headers[key.toLowerCase()] = value;
      });
    }

    this.body = init.body as Body;
    this.query = init.query ?? ({} as Query);
    this.params = init.params ?? ({} as Params);
    this.context = init.context ?? ({} as Context);

    this.originalUrl = init.originalUrl;
    this.httpVersion = init.httpVersion;
    this.cookies = init.cookies ?? {};
    this.signedCookies = init.signedCookies ?? {};
  }

  /**
   * Returns a header value by key.
   */
  getHeader(name: string): string | undefined {
    const value = this.headers[name.toLowerCase()];
    if (Array.isArray(value)) return value[0];
    return value ?? undefined;
  }
}
