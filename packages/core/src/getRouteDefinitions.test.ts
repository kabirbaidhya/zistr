import 'reflect-metadata';
import { Controller, Post, ReqBody, Query, Params, Get, Req, ReqContext } from './decorators';
import { getRouteDefinitions } from './getRouteDefinitions';
import { BaseDto } from './BaseDto';
import { ParamType } from './decorators/metadata';
import { BaseController } from './BaseController';
import { RequestContext } from './ZistrRequest';

describe('getRouteDefinitions', () => {
  it('should return empty array if no routes are defined', () => {
    @Controller('/empty')
    class EmptyController extends BaseController {}

    const routes = getRouteDefinitions([EmptyController]);
    expect(routes).toEqual([]);
  });

  it('should return route info for a simple method decorator', () => {
    @Controller('/api')
    class SimpleController extends BaseController {
      @Get('/hello')
      sayHello() {}
    }

    const routes = getRouteDefinitions([SimpleController]);
    expect(routes).toHaveLength(1);
    expect(routes).toMatchSnapshot();
  });

  it('should handle general param decorators', () => {
    @Controller('/api')
    class TestController extends BaseController {
      @Get('/hello')
      getHello(@Req() _req: Request) {}

      @Post('/hello')
      postHello(@ReqContext() _context: RequestContext) {}
    }

    const routes = getRouteDefinitions([TestController]);
    expect(routes).toHaveLength(2);
    expect(routes).toMatchSnapshot();
  });

  it('should handle method decorator along with parameter decorators and DTOs', () => {
    class MyBodyDto extends BaseDto<MyBodyDto> {
      name!: string;
      getSchema() {
        return { parse: (data: any) => data } as any;
      }
    }

    class MyQueryDto extends BaseDto<MyQueryDto> {
      search!: string;
      getSchema() {
        return { parse: (data: any) => data } as any;
      }
    }

    interface MyParams {
      id: string;
    }

    @Controller('/api')
    class TestController extends BaseController {
      @Post('/')
      testMethod(@ReqBody() _body: MyBodyDto, @Query() _query: MyQueryDto, @Params() _params: MyParams) {}
    }

    const routes = getRouteDefinitions([TestController]);
    expect(routes).toHaveLength(1);

    const route = routes[0];
    expect(route.path).toBe('/api');
    expect(route.requestMethod).toBe('post');
    expect(route.methodName).toBe('testMethod');
    expect(route.controllerName).toBe('TestController');
    expect(route.routeHandler).toEqual(expect.any(Function));

    expect(route.params).toHaveLength(3);
    expect(route.params).toEqual([
      { index: 0, type: ParamType.BODY, dto: MyBodyDto },
      { index: 1, type: ParamType.QUERY, dto: MyQueryDto },
      { index: 2, type: ParamType.PARAMS, dto: undefined },
    ]);
  });
});
