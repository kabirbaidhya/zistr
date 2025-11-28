 
import request from 'supertest';
import express from 'express';
import { getRouteDefinitions, RouteDefinition } from '@zistr/express';

import { TestController } from './helpers/stub';
import { setupTestExpressApp } from './helpers/testUtils';

describe('E2E: Express Compatibility test', () => {
  let app: express.Express;

  beforeAll(() => {
    const routes: RouteDefinition[] = getRouteDefinitions([TestController]);
    app = setupTestExpressApp({ routes, context: { auth: { sid: 'user1' }, foo: 'bar' } });
  });

  it('Route Discovery & Query Injection', async () => {
    const res = await request(app).get('/test/orders?search=laptop');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ query: { search: 'laptop' } });
  });

  it('Body Injection: valid DTO', async () => {
    const res = await request(app).post('/test/orders').send({ item: 'Monitor', quantity: 3 });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ created: true, data: { item: 'Monitor', quantity: 3 } });
  });

  it('Body Injection: invalid DTO triggers validation error', async () => {
    const res = await request(app).post('/test/orders').send({ item: 'Monitor', quantity: 'five' });
    expect(res.status).toBe(400);
    expect(res.body?.error).toContain('"quantity" must be a positive integer');
  });

  it('Params Injection', async () => {
    const res = await request(app).get('/test/orders/abc-123');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ id: 'abc-123' });
  });

  it('Params + Body Injection', async () => {
    const res = await request(app).put('/test/orders/xyz-123').send({ quantity: 12 });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ id: 'xyz-123', updated: 12 });
  });

  it('Context Injection', async () => {
    const res = await request(app).delete('/test/with-context');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      context: { auth: { sid: 'user1' }, foo: 'bar' },
      deleted: true,
      userId: 'user1',
    });
  });

  it('Headers / IP / protocol', async () => {
    const res = await request(app).get('/test/orders').set('x-custom', 'abc').set('Host', 'localhost');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('query');
  });

  it('Multiple routes work independently', async () => {
    const createRes = await request(app).post('/test/orders').send({ item: 'Keyboard', quantity: 1 });
    expect(createRes.status).toBe(200);
    expect(createRes.body).toEqual({ created: true, data: { item: 'Keyboard', quantity: 1 } });

    const getRes = await request(app).get('/test/orders/abc');
    expect(getRes.status).toBe(200);
  });
});
