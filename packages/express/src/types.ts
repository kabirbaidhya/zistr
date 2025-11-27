import { Request } from 'express';
import type { RequestContext } from '@zistr/core';

/**
 * Extended Request type with optional auth payload injected by JWT middleware.
 *
 */
export type EnrichedRequest<Params = Record<string, any>, ReqBody = any, ReqQuery = any> = Request<
  Params,
  any,
  ReqBody,
  ReqQuery
> & {
  auth?: Record<string, unknown>;
  context?: RequestContext;
};
