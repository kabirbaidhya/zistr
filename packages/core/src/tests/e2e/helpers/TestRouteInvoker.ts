import { ZistrRequest, RouteDefinition, SupportedHttpMethod } from '../../../index';

/**
 * Only the properties of ZistrRequest that make sense for test invocation.
 */
export type InvokeOptions = Partial<
  Pick<ZistrRequest, 'body' | 'query' | 'params' | 'headers' | 'context' | 'cookies' | 'ip' | 'protocol'>
>;

export class TestRouteInvoker {
  private routes: RouteDefinition[];

  constructor(routes: RouteDefinition[]) {
    this.routes = routes;
  }

  /**
   * Find a route by method and exact path.
   */
  private findRoute(method: SupportedHttpMethod, path: string): RouteDefinition {
    const route = this.routes.find((r) => r.requestMethod === method && r.path === path);

    if (!route) {
      throw new Error(`No route found for [${method.toUpperCase()}] ${path}`);
    }

    return route;
  }

  /**
   * Build a ZistrRequest for the test.
   */
  private buildRequest(route: RouteDefinition, opts: InvokeOptions): ZistrRequest {
    return new ZistrRequest({
      method: route.requestMethod,
      path: route.path,
      url: route.path,
      originalUrl: route.path,
      body: opts.body ?? {},
      query: opts.query ?? {},
      params: opts.params ?? {},
      headers: opts.headers ?? {},
      context: opts.context ?? {},
      cookies: opts.cookies ?? {},
      protocol: opts.protocol ?? 'http',
      ip: opts.ip ?? '127.0.0.1',
      httpVersion: '1.1',
    });
  }

  /**
   * Invoke a route by method + path, injecting DTOs and returning controller output.
   */
  async invoke(method: SupportedHttpMethod, path: string, opts: InvokeOptions = {}) {
    const route = this.findRoute(method, path);
    const req = this.buildRequest(route, opts);
    return await route.routeHandler(req);
  }
}
