import debug from 'debug';
import { RequestHandler, Router } from 'express';
import { createExpressHandler } from './createExpressHandler';

import { RouteDefinition } from '../core';
import { requestContext } from '../core';
import { DEBUG_EXPRESS_DEFINITION } from './constants';

interface Options {
  routes: RouteDefinition[];
  middlewares?: RequestHandler[];
}

const debugLog = debug(DEBUG_EXPRESS_DEFINITION);

const SUPPORTED_METHODS = ['get', 'post', 'put', 'patch', 'delete', 'options', 'head'] as const;

/**
 * Create an Express router for each routes defined by the controllers.
 *
 * @param routes List of controller-defined routes.
 * @returns {Router} Express Router instance
 */
export function createExpressRouter({ routes, middlewares }: Options): Router {
  const router = Router();

  // Initialise request context.
  router.use(requestContext());

  // Add other middlewares if provided.
  if (middlewares) {
    router.use(...middlewares);
  }

  for (const route of routes) {
    const handler = createExpressHandler(route);

    // if method doesn't exist in the router,
    if (!SUPPORTED_METHODS.includes(route.requestMethod)) {
      throw new Error(`Unsupported request method: ${route.requestMethod}`);
    }

    router[route.requestMethod](route.path, handler);

    debugLog(`registered route - [${route.requestMethod.toUpperCase()}] ${route.path}`);
  }

  return router;
}
