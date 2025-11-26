import { Request, Response, NextFunction } from 'express';
import { RouteDefinition } from '@zistr/core';

import { mapRequestToZistr } from './mapRequestToZistr';
import { DEBUG_EXPRESS_EXECUTION } from './constants';
import debug from 'debug';

const debugLog = debug(DEBUG_EXPRESS_EXECUTION);

/**
 * Creates an Express-compatible request handler for a given controller method.
 */
export function createExpressHandler(routeDefinition: RouteDefinition) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const zistrReq = mapRequestToZistr(req);
      debugLog('running express route handler', { req, zistrReq });

      const result = await routeDefinition.routeHandler(zistrReq);

      debugLog('processing controller result', { result });

      // Controller must return an object of type Promise<ControllerResult> or a string.
      if (!result || (typeof result !== 'object' && typeof result !== 'string')) {
        throw new Error(
          `Invalid result returned by controller - ${routeDefinition.controllerName}.${routeDefinition.methodName}`
        );
      }

      // If controller returns string result.
      if (typeof result === 'string') {
        res.send(result);
        return;
      }

      const { status, data, contentType } = result;

      debugLog(`response - ${req.method} ${req.originalUrl}`, {
        status,
        type: contentType ?? 'application/json',
        data: typeof data === 'object' ? JSON.stringify(data) : data,
      });

      // If data is empty, send empty response
      if (data === null || data === undefined) {
        res.status(status ?? 204).end();
        return;
      }

      // Set the content type (default to JSON)
      if (contentType) {
        res.type(contentType);
      }

      // Send response
      if (contentType === 'text/plain' || typeof data === 'string') {
        res.status(status).send(data);
      } else {
        res.status(status).json(data);
      }
    } catch (err) {
      debugLog(`error - ${req.method} ${req.originalUrl}:`, err);

      next(err);
    }
  };
}
