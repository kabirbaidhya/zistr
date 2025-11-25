/* eslint-disable @typescript-eslint/no-explicit-any */
import { Get, Post, Put, Patch, Delete } from './method';
import { getRoutes } from './metadata';

describe('Decorators: Method', () => {
  it.each([
    ['get', Get],
    ['post', Post],
    ['put', Put],
    ['patch', Patch],
    ['delete', Delete],
  ])('should store route metadata for @%s decorator', (method, decorator) => {
    class TestController {
      @decorator('/path')
      myMethod() {}
    }

    const routes = getRoutes(TestController);
    expect(routes).toHaveLength(1);
    expect(routes[0]).toEqual({
      methodName: 'myMethod',
      path: '/path',
      requestMethod: method,
    });
  });

  it('should support empty path default for route decorators', () => {
    class MyController {
      @Get()
      myRoute() {}
    }

    const routes = getRoutes(MyController);
    expect(routes[0].path).toBe('');
  });

  it('should accumulate multiple route decorators on same controller', () => {
    class MultiParam {
      @Get('/a')
      a() {}

      @Post('/b')
      b() {}
    }

    const routes = getRoutes(MultiParam);
    expect(routes).toHaveLength(2);
    expect(routes.map((r: any) => r.path)).toEqual(['/a', '/b']);
  });
});
