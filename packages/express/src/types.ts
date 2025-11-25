import { Request } from 'express';
import { JwtPayload } from 'jsonwebtoken';

import type { RequestContext } from '../core';

/**
 * Extended Request type with optional auth payload injected by JWT middleware.
 *
 * @template Params - route params
 * @template ReqBody - request body type
 * @template ReqQuery - query parameters type
 */
export type EnrichedRequest<Params = Record<string, any>, ReqBody = any, ReqQuery = any> = Request<
  Params,
  any,
  ReqBody,
  ReqQuery
> & {
  auth?: JwtPayload;
  context?: RequestContext;
};
