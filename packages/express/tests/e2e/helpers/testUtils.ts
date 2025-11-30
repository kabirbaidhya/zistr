import express, { json } from 'express';
import { createExpressRouter, EnrichedRequest, RouteDefinition } from '@zistr/express';
import { requestContext } from '@zistr/express/middlewares';

import { DummyValidationError } from './stub';

interface Options {
  routes: RouteDefinition[];
  context?: Record<string, unknown>;
}
export const setupTestExpressApp = ({ routes, context }: Options): express.Express => {
  const app = express();
  app.use(json());

  app.use(
    '/',
    createExpressRouter({
      routes,
      middlewares: [
        // Context injection.
        requestContext((req: EnrichedRequest) => {
          return {
            ...req.context,
            ...context,
          };
        }),
      ],
    })
  );

  // generic error handler
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    if (err instanceof DummyValidationError) {
      res.status(400).json({ error: err.message });
      return;
    }

    res.status(500).json({ error: err.message });
  });

  return app;
};
