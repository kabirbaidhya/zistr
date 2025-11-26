import type { Request as ExpressRequest } from 'express';
import { ZistrRequest, RequestContext, ParamsDictionary } from '@zistr/core';
import type { ParsedQs } from 'qs';

/**
 * Maps an Express Request object into a ZistrRequest instance.
 *
 * @param {ExpressRequest} req
 * @returns {ZistrRequest}
 */
export function mapRequestToZistr<Body = unknown, Context extends RequestContext = RequestContext>(
  req: ExpressRequest
): ZistrRequest<Body, ParsedQs, ParamsDictionary, Context> {
  return new ZistrRequest<Body, ParsedQs, ParamsDictionary, Context>({
    method: req.method,
    url: req.url,
    path: req.path,
    protocol: req.protocol,
    originalUrl: req.originalUrl,
    httpVersion: req.httpVersion,
    headers: req.headers,
    ip: req.ip,
    body: req.body as Body,
    query: req.query,
    params: req.params,
    context: (req as any).context ?? ({} as Context),
    cookies: req.cookies ?? {},
    signedCookies: req.signedCookies ?? {},
  });
}
