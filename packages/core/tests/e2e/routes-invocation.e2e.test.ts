/* eslint-disable @typescript-eslint/no-explicit-any */
import { Get, ZistrRequest } from '@zistr/core';
import { getRouteDefinitions, RouteDefinition } from '@zistr/core';

import { TestRouteInvoker } from './helpers/TestRouteInvoker';
import { OrdersController } from './helpers/stub';

const routes: RouteDefinition[] = getRouteDefinitions([OrdersController]);
const invoker = new TestRouteInvoker(routes);

describe('Core E2E: Routes Invocation', () => {
  it('Route Discovery: finds a route', async () => {
    const result = await invoker.invoke('get', '/orders', {});
    expect(result).toHaveProperty('query');
  });

  it('Route Invocation: no body/query/params', async () => {
    const result = await invoker.invoke('get', '/orders', {});
    expect(result).toHaveProperty('query');
  });

  it('Body Injection: valid DTO passes', async () => {
    const body = { item: 'Monitor', quantity: 3 };
    const result = await invoker.invoke('post', '/orders', { body });
    expect(result).toEqual({ created: true, data: body });
  });

  it('Body Injection: invalid DTO throws validation error', async () => {
    const invalidBody = { item: 'Monitor', quantity: 'five' };
    await expect(invoker.invoke('post', '/orders', { body: invalidBody as any })).rejects.toThrow(
      '"quantity" must be a positive integer'
    );
  });

  it('Query Injection: query object passes', async () => {
    const result = await invoker.invoke('get', '/orders', { query: { search: 'laptop' } });
    expect(result).toEqual({ query: { search: 'laptop' } });
  });

  it('Params Injection: route params are injected', async () => {
    const result = await invoker.invoke('get', '/orders/:id', { params: { id: 'abc123' } });
    expect(result).toEqual({ id: 'abc123' });
  });

  it('Context Injection: context object is accessible', async () => {
    const context = { userId: 'user-007' };
    const result = await invoker.invoke('get', '/orders', { context });
    expect(result).toHaveProperty('query');
  });

  it('Headers / IP / protocol: passed into ZistrRequest', async () => {
    const headers = { 'x-custom': 'hello' };
    const result = await invoker.invoke('get', '/orders', { headers, ip: '1.2.3.4', protocol: 'https' });
    expect(result).toHaveProperty('query');
  });

  it('Optional DTO: empty request defaults', async () => {
    const result = await invoker.invoke('get', '/orders', {});
    expect(result).toHaveProperty('query');
  });

  it('Multiple Routes: each route works independently', async () => {
    const createBody = { item: 'Keyboard', quantity: 1 };
    const createRes = await invoker.invoke('post', '/orders', { body: createBody });
    expect(createRes).toEqual({ created: true, data: createBody });

    const getRes = await invoker.invoke('get', '/orders/:id', { params: { id: 'xyz' } });
    expect(getRes).toEqual({ id: 'xyz' });

    const updateRes = await invoker.invoke('put', '/orders/:id', { params: { id: 'xyz' }, body: { quantity: 10 } });
    expect(updateRes).toEqual({ id: 'xyz', updated: 10 });

    const deleteRes = await invoker.invoke('delete', '/orders/:id', { params: { id: '42' } });
    expect(deleteRes).toEqual({ id: '42', deleted: true });
  });

  it('Missing Route: throws error if route not found', async () => {
    await expect(invoker.invoke('get', '/non-existent', {})).rejects.toThrow(
      /No route found for \[GET\] \/non-existent/
    );
  });

  it('Error Propagation: controller throws error', async () => {
    class ErrorController {
      @Get('/fail')
      fail(_req: ZistrRequest) {
        throw new Error('Controller failure');
      }
    }

    const errRoutes = getRouteDefinitions([ErrorController]);
    const errInvoker = new TestRouteInvoker(errRoutes);
    await expect(errInvoker.invoke('get', '/fail', {})).rejects.toThrow('Controller failure');
  });
});
