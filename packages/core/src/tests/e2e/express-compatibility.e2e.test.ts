/* eslint-disable @typescript-eslint/no-explicit-any */
import request from 'supertest';
import express, { json, Request as ExpressRequest, Response } from 'express';

import { getRouteDefinitions, ZistrRequest } from '../../index';

function mapExpressRequestToZistr(req: ExpressRequest): ZistrRequest {
  return new ZistrRequest({
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
    context: (req as any).context ?? {},
    cookies: req.cookies ?? {},
    signedCookies: req.signedCookies ?? {},
  });
}

import { OrdersController } from './helpers/stub';

const setupTestApp = (): express.Express => {
  const app = express();
  app.use(json());

  const routes = getRouteDefinitions([OrdersController]);
  const router = express.Router();

  // Attach all controller routes to Express using only the public API
  for (const route of routes) {
    const method = route.requestMethod;
    const path = route.path;

    router[method](path, async (req: ExpressRequest, res: Response) => {
      try {
        const zReq = mapExpressRequestToZistr(req);
        const result = await route.routeHandler(zReq);

        // Allow controllers to return values directly
        res.status(200).json(result);
      } catch (error: any) {
        res.status(400).json({ error: error.message });
      }
    });
  }

  app.use(router);

  return app;
};

describe('E2E: Express Compatibility test', () => {
  let app: express.Express;

  beforeAll(() => {
    app = setupTestApp();
  });

  it('Route Discovery & Query Injection', async () => {
    const res = await request(app).get('/orders?search=laptop');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ query: { search: 'laptop' } });
  });

  it('Body Injection: valid DTO', async () => {
    const res = await request(app).post('/orders').send({ item: 'Monitor', quantity: 3 });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ created: true, data: { item: 'Monitor', quantity: 3 } });
  });

  it('Body Injection: invalid DTO triggers validation error', async () => {
    const res = await request(app).post('/orders').send({ item: 'Monitor', quantity: 'five' });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('Params Injection', async () => {
    const res = await request(app).get('/orders/abc123');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ id: 'abc123' });
  });

  it('Params + Body Injection', async () => {
    const res = await request(app).put('/orders/xyz').send({ quantity: 12 });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ id: 'xyz', updated: 12 });
  });

  it('DELETE route', async () => {
    const res = await request(app).delete('/orders/42');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ id: '42', deleted: true });
  });

  it('Context Injection (example)', async () => {
    const res = await request(app).get('/orders');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('query');
  });

  it('Headers / IP / protocol', async () => {
    const res = await request(app).get('/orders').set('x-custom', 'abc').set('Host', 'localhost');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('query');
  });

  it('Multiple routes work independently', async () => {
    const createRes = await request(app).post('/orders').send({ item: 'Keyboard', quantity: 1 });
    expect(createRes.status).toBe(200);
    expect(createRes.body).toEqual({ created: true, data: { item: 'Keyboard', quantity: 1 } });

    const getRes = await request(app).get('/orders/abc');
    expect(getRes.status).toBe(200);
  });
});
