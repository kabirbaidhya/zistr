/* eslint-disable @typescript-eslint/no-explicit-any */

import { createRouteHandler } from './createRouteHandler';
import { ZistrRequest } from './ZistrRequest';
import { ParamType } from './decorators/metadata';
import { BaseDto } from './BaseDto';
import type { ParamMetadata } from './types';

class TestBodyDto extends BaseDto {
  name!: string;
}

class TestQueryDto extends BaseDto {
  q!: string;
}

class TestParamsDto extends BaseDto {
  id!: string;
}

class UserController {
  async createUser(
    body: TestBodyDto,
    params: TestParamsDto,
    query: TestQueryDto,
    req: ZistrRequest,
    context: Record<string, unknown>
  ) {
    return {
      action: 'createUser',
      user: {
        name: body.name,
        id: params.id,
      },
      query: {
        q: query.q,
      },
      metadata: {
        method: req.method,
        context,
      },
      req,
    };
  }

  async getUser() {
    return { action: 'getUser' };
  }

  async echoRequest(req: ZistrRequest) {
    return { method: req.method, path: req.path };
  }
}

function makeRequest(overrides: Partial<ZistrRequest> = {}) {
  return new ZistrRequest({
    method: 'POST',
    url: '/users/42?q=hello',
    path: '/users/42',
    protocol: 'http',
    originalUrl: '/users/42?q=hello',
    httpVersion: '1.1',
    headers: {},
    ip: '127.0.0.1',
    body: { name: 'John Doe' },
    query: { q: 'hello' },
    params: { id: '42' },
    context: { requestId: 'req_1' },
    ...overrides,
  });
}

// ---------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------

describe('createRouteHandler', () => {
  it('injects DTOs, request, and context into controller in correct order', async () => {
    const controller = new UserController();

    const paramsMeta: ParamMetadata[] = [
      { index: 0, type: ParamType.BODY, dto: TestBodyDto },
      { index: 1, type: ParamType.PARAMS, dto: TestParamsDto },
      { index: 2, type: ParamType.QUERY, dto: TestQueryDto },
      { index: 3, type: ParamType.REQUEST },
      { index: 4, type: ParamType.REQUEST_CONTEXT },
    ];

    const handler = createRouteHandler({
      controllerInstance: controller,
      controllerName: UserController.name,
      methodName: 'createUser',
      params: paramsMeta,
    });

    const req = makeRequest();
    const result: any = await handler(req);

    expect(result.action).toBe('createUser');
    expect(result.req).toBe(req);

    // Validated DTO injection
    expect(result.user).toEqual({
      name: 'John Doe',
      id: '42',
    });

    expect(result.query).toEqual({ q: 'hello' });

    expect(result.metadata.method).toBe('POST');
    expect(result.metadata.context).toEqual({ requestId: 'req_1' });
  });

  it('supports controller methods without parameters', async () => {
    const controller = new UserController();

    const handler = createRouteHandler({
      controllerInstance: controller,
      controllerName: UserController.name,
      methodName: 'getUser',
      params: [],
    });

    const result: any = await handler(makeRequest());

    expect(result).toEqual({ action: 'getUser' });
  });

  it('injects only the request object when ParamType.REQUEST is used', async () => {
    const controller = new UserController();

    const paramsMeta: ParamMetadata[] = [{ index: 0, type: ParamType.REQUEST }];

    const handler = createRouteHandler({
      controllerInstance: controller,
      controllerName: UserController.name,
      methodName: 'echoRequest',
      params: paramsMeta,
    });

    const req = makeRequest({ method: 'GET', path: '/health' });
    const result: any = await handler(req);

    expect(result).toEqual({ method: 'GET', path: '/health' });
  });

  it('injects null for unknown ParamType values', async () => {
    const controller = {
      async unknown(value: unknown) {
        return { injected: value };
      },
    };

    const paramsMeta: ParamMetadata[] = [{ index: 0, type: 9999 as any }];

    const handler = createRouteHandler({
      controllerInstance: controller as any,
      controllerName: 'UnknownController',
      methodName: 'unknown',
      params: paramsMeta,
    });

    const result: any = await handler(makeRequest());

    expect(result).toEqual({ injected: null });
  });

  it('throws validation errors for invalid DTO input', async () => {
    const controller = new UserController();

    const paramsMeta: ParamMetadata[] = [{ index: 0, type: ParamType.BODY, dto: TestBodyDto }];

    const handler = createRouteHandler({
      controllerInstance: controller,
      controllerName: UserController.name,
      methodName: 'createUser', // method takes more params, but we only test validation here
      params: paramsMeta,
    });

    const req = makeRequest({ body: { name: 123 } }); // invalid input type

    await expect(handler(req)).rejects.toThrow();
  });
});
