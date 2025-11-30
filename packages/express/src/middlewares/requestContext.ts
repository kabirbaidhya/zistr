import { NextFunction, Response } from 'express';
import debug from 'debug';
import { RequestContext } from '@zistr/core';

import { EnrichedRequest } from '../types';
import { DEBUG_EXPRESS_EXECUTION } from '../constants';

export type ContextSetterFunction = (req: EnrichedRequest) => RequestContext;

const debugLog = debug(DEBUG_EXPRESS_EXECUTION);

/**
 * Returns a middleware to initialise Express request context.
 */
export const requestContext =
  (contextSetter?: ContextSetterFunction) => (req: EnrichedRequest, _: Response, next: NextFunction) => {
    // Initialise request context.
    req.context = req.context || {};

    // Amend request context if setter is provided.
    if (contextSetter) {
      Object.assign(req.context, contextSetter(req));
    }

    debugLog('set request context', { context: req.context });

    next();
  };
