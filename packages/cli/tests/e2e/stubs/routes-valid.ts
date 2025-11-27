import { RouteDefinition } from '@zistr/core';

export const routes: RouteDefinition[] = [
  new RouteDefinition({
    path: '/users',
    requestMethod: 'post',
    methodName: 'createUser',
    controllerName: 'UserController',
    handler: async () => ({ data: 'test', status: 200 }),
    params: [],
  }),

  new RouteDefinition({
    path: '/users',
    requestMethod: 'get',
    methodName: 'getUsers',
    controllerName: 'UserController',
    handler: async () => ({ data: 'test', status: 200 }),
    params: [],
  }),

  new RouteDefinition({
    path: '/users/:id',
    requestMethod: 'get',
    methodName: 'getUserById',
    controllerName: 'UserController',
    handler: async () => ({ data: 'test', status: 200 }),
    params: [],
  }),

  new RouteDefinition({
    path: '/users/:id',
    requestMethod: 'put',
    methodName: 'updateUser',
    controllerName: 'UserController',
    handler: async () => ({ data: 'test', status: 200 }),
    params: [],
  }),

  new RouteDefinition({
    path: '/users/:id',
    requestMethod: 'delete',
    methodName: 'deleteUser',
    controllerName: 'UserController',
    handler: async () => ({ data: 'test', status: 200 }),
    params: [],
  }),
];
