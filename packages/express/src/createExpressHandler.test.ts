/* eslint-disable @typescript-eslint/no-explicit-any */
import { createExpressHandler } from './createExpressHandler';
import { config } from '../../../config';
import { mapRequestToZistr } from './mapRequestToZistr';
import { RouteDefinition } from '../core';

describe('createExpressHandler', () => {
  const mockReq = (overrides = {}) =>
    ({
      method: 'GET',
      originalUrl: '/test',
      ...overrides,
    }) as any;

  const mockRes = () => {
    const res: any = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    res.send = jest.fn().mockReturnValue(res);
    res.type = jest.fn().mockReturnValue(res);
    res.end = jest.fn().mockReturnValue(res);
    return res;
  };

  const mockNext = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    config.app = { enableRequestLog: false } as any; // default
  });

  const testRoute: RouteDefinition = {
    path: '/test',
    requestMethod: 'get',
    methodName: 'handlerMethod',
    params: [],
    controllerName: 'TestController',
    routeHandler: jest.fn(),
  };

  // ---- Tests ----

  it('sends string responses directly', async () => {
    const routeDefinition: any = {
      ...testRoute,
      routeHandler: jest.fn().mockResolvedValue('hello'),
    };

    const handler = createExpressHandler(routeDefinition);
    const req = mockReq();
    const res = mockRes();

    await handler(req, res, mockNext);

    const zistrReq = mapRequestToZistr(req);

    expect(routeDefinition.routeHandler).toHaveBeenCalledWith(zistrReq);
    expect(res.send).toHaveBeenCalledWith('hello');
    expect(res.json).not.toHaveBeenCalled();
  });

  it('sends JSON responses for object results', async () => {
    const controllerResult = {
      status: 200,
      data: { ok: true },
    };

    const routeDefinition: any = {
      ...testRoute,
      routeHandler: jest.fn().mockResolvedValue(controllerResult),
    };

    const handler = createExpressHandler(routeDefinition);
    const req = mockReq();
    const res = mockRes();

    await handler(req, res, mockNext);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ ok: true });
  });

  it('uses res.send for text/plain contentType', async () => {
    const controllerResult = {
      status: 201,
      data: 'plain text',
      contentType: 'text/plain',
    };

    const routeDefinition: any = {
      ...testRoute,
      routeHandler: jest.fn().mockResolvedValue(controllerResult),
    };

    const handler = createExpressHandler(routeDefinition);
    const req = mockReq();
    const res = mockRes();

    await handler(req, res, mockNext);

    expect(res.type).toHaveBeenCalledWith('text/plain');
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.send).toHaveBeenCalledWith('plain text');
  });

  it('throws if controller returns invalid result', async () => {
    const routeDefinition: any = {
      ...testRoute,
      routeHandler: jest.fn().mockResolvedValue(123 as any), // invalid
    };

    const handler = createExpressHandler(routeDefinition);
    const req = mockReq();
    const res = mockRes();

    await handler(req, res, mockNext);

    expect(mockNext).toHaveBeenCalled();
    const errArg = mockNext.mock.calls[0][0];
    expect(errArg).toBeInstanceOf(Error);
    expect(errArg.message).toContain('Invalid result');
  });

  it('forwards errors to next()', async () => {
    const error = new Error('failure');

    const routeDefinition: any = {
      ...testRoute,
      routeHandler: jest.fn().mockRejectedValue(error),
    };

    const handler = createExpressHandler(routeDefinition);
    const req = mockReq();
    const res = mockRes();

    await handler(req, res, mockNext);

    expect(mockNext).toHaveBeenCalledWith(error);
  });

  it('uses .json() when data is an object even if custom contentType is provided', async () => {
    const routeDefinition: any = {
      ...testRoute,
      routeHandler: jest.fn().mockResolvedValue({
        status: 200,
        data: { ok: true },
        contentType: 'application/xml',
      }),
    };

    const handler = createExpressHandler(routeDefinition);
    const req = mockReq();
    const res = mockRes();

    await handler(req, res, mockNext);

    expect(res.type).toHaveBeenCalledWith('application/xml');
    expect(res.json).toHaveBeenCalledWith({ ok: true });
    expect(res.send).not.toHaveBeenCalled();
  });

  it('uses .send() when contentType is provided and data is a string', async () => {
    const routeDefinition: any = {
      ...testRoute,
      routeHandler: jest.fn().mockResolvedValue({
        status: 201,
        data: '<h1>Hello</h1>',
        contentType: 'text/html',
      }),
    };

    const handler = createExpressHandler(routeDefinition);
    const req = mockReq();
    const res = mockRes();

    await handler(req, res, mockNext);

    expect(res.type).toHaveBeenCalledWith('text/html');
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.send).toHaveBeenCalledWith('<h1>Hello</h1>');
    expect(res.json).not.toHaveBeenCalled();
  });

  it('throws if controller returns null', async () => {
    const routeDefinition: any = {
      ...testRoute,
      routeHandler: jest.fn().mockResolvedValue(null),
    };

    const handler = createExpressHandler(routeDefinition);
    const req = mockReq();
    const res = mockRes();

    await handler(req, res, mockNext);

    expect(mockNext).toHaveBeenCalled();
    expect(mockNext.mock.calls[0][0]).toBeInstanceOf(Error);
  });

  it('throws if controller returns undefined', async () => {
    const routeDefinition: any = {
      ...testRoute,
      routeHandler: jest.fn().mockResolvedValue(undefined),
    };

    const handler = createExpressHandler(routeDefinition);
    const req = mockReq();
    const res = mockRes();

    await handler(req, res, mockNext);

    expect(mockNext).toHaveBeenCalled();
    expect(mockNext.mock.calls[0][0]).toBeInstanceOf(Error);
  });

  it('continues and sends JSON even if status is undefined (invalid ControllerResult)', async () => {
    const routeDefinition: any = {
      ...testRoute,
      routeHandler: jest.fn().mockResolvedValue({
        data: { ok: true }, // no status
      }),
    };

    const handler = createExpressHandler(routeDefinition);
    const req = mockReq();
    const res = mockRes();

    await handler(req, res, mockNext);

    // Current behavior: will call status(undefined) → not great,
    // but test should reflect current logic unless you change it.
    expect(res.status).toHaveBeenCalledWith(undefined);
    expect(res.json).toHaveBeenCalledWith({
      ok: true,
    });
  });

  it('sends empty response (no body) if data is empty', async () => {
    const routeDefinition: any = {
      ...testRoute,
      routeHandler: jest.fn().mockResolvedValue({
        status: 200,
        data: null,
      }),
    };

    const handler = createExpressHandler(routeDefinition);
    const req = mockReq();
    const res = mockRes();

    await handler(req, res, mockNext);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.end).toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
    expect(res.send).not.toHaveBeenCalled();
  });

  it('sends empty response with 204 status if data and status both are empty', async () => {
    const routeDefinition: any = {
      ...testRoute,
      routeHandler: jest.fn().mockResolvedValue({
        status: null,
        data: null,
      }),
    };

    const handler = createExpressHandler(routeDefinition);
    const req = mockReq();
    const res = mockRes();

    await handler(req, res, mockNext);

    expect(res.status).toHaveBeenCalledWith(204);
    expect(res.end).toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
    expect(res.send).not.toHaveBeenCalled();
  });

  it('forwards synchronous errors thrown inside controller', async () => {
    const error = new Error('sync boom');

    const routeDefinition: any = {
      ...testRoute,
      routeHandler: jest.fn(() => {
        throw error;
      }),
    };

    const handler = createExpressHandler(routeDefinition);
    const req = mockReq();
    const res = mockRes();

    await handler(req, res, mockNext);

    expect(mockNext).toHaveBeenCalledWith(error);
  });
});
