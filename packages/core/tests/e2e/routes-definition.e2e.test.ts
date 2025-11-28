import 'reflect-metadata';
import {
  Controller,
  Get,
  Post,
  ReqBody,
  Query,
  Params,
  Req,
  ReqContext,
  getRouteDefinitions,
  BaseController,
  Delete,
  Patch,
  Put,
} from '@zistr/core';

describe('E2E: Routes Definition', () => {
  it('should return empty array if no routes are defined', () => {
    @Controller('/empty')
    class EmptyController extends BaseController {}

    const routes = getRouteDefinitions([EmptyController]);
    expect(routes).toEqual([]);
  });

  it('should return route info correctly for a simple controller with decorated methods', () => {
    @Controller('/api')
    class SimpleController extends BaseController {
      @Get('/hello')
      sayHello() {}

      otherMethod() {}
    }

    const routes = getRouteDefinitions([SimpleController]);
    expect(routes).toHaveLength(1);
    expect(routes[0]).toStrictEqual(
      expect.objectContaining({
        path: '/api/hello',
        requestMethod: 'get',
        methodName: 'sayHello',
        controllerName: 'SimpleController',
        params: [],
        routeHandler: expect.any(Function),
      })
    );
  });

  it('should support paths without leading slash', () => {
    @Controller('api/test')
    class SimpleController extends BaseController {
      @Get('hello')
      test() {}

      otherMethod() {}
    }

    const routes = getRouteDefinitions([SimpleController]);
    expect(routes).toHaveLength(1);
    expect(routes[0]).toStrictEqual(
      expect.objectContaining({
        path: '/api/test/hello',
        requestMethod: 'get',
        methodName: 'test',
        controllerName: 'SimpleController',
        params: [],
        routeHandler: expect.any(Function),
      })
    );
  });

  it('should support method decorators with no path', () => {
    @Controller('/api/test')
    class SimpleController extends BaseController {
      @Get()
      test() {}

      otherMethod() {}
    }

    const routes = getRouteDefinitions([SimpleController]);
    expect(routes).toHaveLength(1);
    expect(routes[0]).toStrictEqual(
      expect.objectContaining({
        path: '/api/test',
        requestMethod: 'get',
        methodName: 'test',
        controllerName: 'SimpleController',
        params: [],
        routeHandler: expect.any(Function),
      })
    );
  });

  it('should support both controller and method decorator without path', () => {
    @Controller()
    class SimpleController extends BaseController {
      @Get()
      testOne() {}

      @Post()
      testTwo() {}

      otherMethod() {}
    }

    const routes = getRouteDefinitions([SimpleController]);
    expect(routes).toHaveLength(2);
    expect(routes[0]).toStrictEqual(
      expect.objectContaining({
        path: '/',
        requestMethod: 'get',
        methodName: 'testOne',
        controllerName: 'SimpleController',
        params: [],
        routeHandler: expect.any(Function),
      })
    );
    expect(routes[1]).toStrictEqual(
      expect.objectContaining({
        path: '/',
        requestMethod: 'post',
        methodName: 'testTwo',
        controllerName: 'SimpleController',
        params: [],
        routeHandler: expect.any(Function),
      })
    );
  });

  it('should define all method and parameter decorators correctly', () => {
    @Controller('/example')
    class FullController extends BaseController {
      @Get('/get')
      getMethod(
        @ReqBody() _body: any,
        @Query() _query: any,
        @Params() _params: any,
        @Req() _req: any,
        @ReqContext() _ctx: any
      ) {}

      @Post('/post')
      postMethod(@ReqBody() _body: any) {}

      @Put('/put')
      putMethod(@Params() _params: any) {}

      @Patch('/patch')
      patchMethod(@Query() _query: any) {}

      @Delete('/delete')
      deleteMethod() {}

      helperMethod() {}
    }

    const routes = getRouteDefinitions([FullController]);

    expect(routes).toStrictEqual([
      expect.objectContaining({
        path: '/example/get',
        requestMethod: 'get',
        methodName: 'getMethod',
        controllerName: 'FullController',
        params: [
          { index: 0, type: 'body' },
          { index: 1, type: 'query' },
          { index: 2, type: 'params' },
          { index: 3, type: 'request' },
          { index: 4, type: 'request_context' },
        ],
        routeHandler: expect.any(Function),
      }),
      expect.objectContaining({
        path: '/example/post',
        requestMethod: 'post',
        methodName: 'postMethod',
        controllerName: 'FullController',
        params: [{ index: 0, type: 'body' }],
        routeHandler: expect.any(Function),
      }),
      expect.objectContaining({
        path: '/example/put',
        requestMethod: 'put',
        methodName: 'putMethod',
        controllerName: 'FullController',
        params: [{ index: 0, type: 'params' }],
        routeHandler: expect.any(Function),
      }),
      expect.objectContaining({
        path: '/example/patch',
        requestMethod: 'patch',
        methodName: 'patchMethod',
        controllerName: 'FullController',
        params: [{ index: 0, type: 'query' }],
        routeHandler: expect.any(Function),
      }),
      expect.objectContaining({
        path: '/example/delete',
        requestMethod: 'delete',
        methodName: 'deleteMethod',
        controllerName: 'FullController',
        params: [],
        routeHandler: expect.any(Function),
      }),
    ]);
  });
});
