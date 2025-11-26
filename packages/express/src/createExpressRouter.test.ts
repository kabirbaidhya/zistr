/* eslint-disable @typescript-eslint/no-explicit-any */
import { createExpressRouter } from './createExpressRouter';
import { createExpressHandler } from './createExpressHandler';
import { RouteDefinition } from '@zistr/core';

// Mock createExpressHandler
jest.mock('./createExpressHandler', () => ({
  createExpressHandler: jest.fn(() => jest.fn((_req, res) => res.json({ ok: true }))),
}));

// Mock express.Router
const mockGet = jest.fn();
const mockPost = jest.fn();
const mockPut = jest.fn();
const mockPatch = jest.fn();
const mockDelete = jest.fn();
const mockUse = jest.fn();

jest.mock('express', () => ({
  Router: jest.fn(() => ({
    get: mockGet,
    post: mockPost,
    put: mockPut,
    patch: mockPatch,
    delete: mockDelete,
    use: mockUse,
  })),
}));

describe('createExpressRouter', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should register all controller routes on the router', () => {
    const routes: RouteDefinition[] = [
      {
        controllerName: 'TestController',
        methodName: 'getTodos',
        params: [],
        path: '/api/todos',
        requestMethod: 'get',
        routeHandler: async () => ({ status: 200, data: 'todo list' }),
      },
      {
        controllerName: 'TestController',
        methodName: 'createTodo',
        params: [],
        path: '/api/todos',
        requestMethod: 'post',
        routeHandler: async () => ({ status: 201, data: 'created item' }),
      },
    ];

    const router = createExpressRouter({ routes });

    // Router object returned
    expect(router).toBeDefined();

    // Ensure router methods called correctly
    expect(mockGet).toHaveBeenCalledWith('/api/todos', expect.any(Function));
    expect(mockPost).toHaveBeenCalledWith('/api/todos', expect.any(Function));

    // Ensure handlers created for each route
    expect(createExpressHandler).toHaveBeenCalledTimes(2);
    expect(createExpressHandler).toHaveBeenNthCalledWith(1, routes[0]);
    expect(createExpressHandler).toHaveBeenNthCalledWith(2, routes[1]);
  });

  it('should throw for unsupported HTTP method', () => {
    const routes: RouteDefinition[] = [
      {
        controllerName: 'TestController',
        methodName: 'getTodos',
        params: [],
        path: '/api/todos',
        requestMethod: 'trace' as any,
        routeHandler: async () => ({ status: 200, data: 'todo list' }),
      },
    ];

    expect(() => createExpressRouter({ routes })).toThrow('Unsupported request method: trace');
  });
});
