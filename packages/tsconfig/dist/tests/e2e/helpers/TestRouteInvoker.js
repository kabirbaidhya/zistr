"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TestRouteInvoker = void 0;
const index_1 = require("../../../index");
class TestRouteInvoker {
    constructor(routes) {
        this.routes = routes;
    }
    /**
     * Find a route by method and exact path.
     */
    findRoute(method, path) {
        const route = this.routes.find((r) => r.requestMethod === method && r.path === path);
        if (!route) {
            throw new Error(`No route found for [${method.toUpperCase()}] ${path}`);
        }
        return route;
    }
    /**
     * Build a ZistrRequest for the test.
     */
    buildRequest(route, opts) {
        return new index_1.ZistrRequest({
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
    async invoke(method, path, opts = {}) {
        const route = this.findRoute(method, path);
        const req = this.buildRequest(route, opts);
        return await route.routeHandler(req);
    }
}
exports.TestRouteInvoker = TestRouteInvoker;
