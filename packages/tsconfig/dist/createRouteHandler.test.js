"use strict";
/* eslint-disable @typescript-eslint/no-explicit-any */
Object.defineProperty(exports, "__esModule", { value: true });
const createRouteHandler_1 = require("./createRouteHandler");
const ZistrRequest_1 = require("./ZistrRequest");
const metadata_1 = require("./decorators/metadata");
const BaseDto_1 = require("./BaseDto");
// ---------------------------------------------------------------------
// DTOs WITH SCHEMAS
// ---------------------------------------------------------------------
class TestBodyDto extends BaseDto_1.BaseDto {
}
class TestQueryDto extends BaseDto_1.BaseDto {
}
class TestParamsDto extends BaseDto_1.BaseDto {
}
// ---------------------------------------------------------------------
// Realistic controller
// ---------------------------------------------------------------------
class UserController {
    async createUser(body, params, query, req, context) {
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
    async echoRequest(req) {
        return { method: req.method, path: req.path };
    }
}
// ---------------------------------------------------------------------
// Helper to make request
// ---------------------------------------------------------------------
function makeRequest(overrides = {}) {
    return new ZistrRequest_1.ZistrRequest({
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
        const paramsMeta = [
            { index: 0, type: metadata_1.ParamType.BODY, dto: TestBodyDto },
            { index: 1, type: metadata_1.ParamType.PARAMS, dto: TestParamsDto },
            { index: 2, type: metadata_1.ParamType.QUERY, dto: TestQueryDto },
            { index: 3, type: metadata_1.ParamType.REQUEST },
            { index: 4, type: metadata_1.ParamType.REQUEST_CONTEXT },
        ];
        const handler = (0, createRouteHandler_1.createRouteHandler)({
            controllerInstance: controller,
            controllerName: UserController.name,
            methodName: 'createUser',
            params: paramsMeta,
        });
        const req = makeRequest();
        const result = await handler(req);
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
        const handler = (0, createRouteHandler_1.createRouteHandler)({
            controllerInstance: controller,
            controllerName: UserController.name,
            methodName: 'getUser',
            params: [],
        });
        const result = await handler(makeRequest());
        expect(result).toEqual({ action: 'getUser' });
    });
    it('injects only the request object when ParamType.REQUEST is used', async () => {
        const controller = new UserController();
        const paramsMeta = [{ index: 0, type: metadata_1.ParamType.REQUEST }];
        const handler = (0, createRouteHandler_1.createRouteHandler)({
            controllerInstance: controller,
            controllerName: UserController.name,
            methodName: 'echoRequest',
            params: paramsMeta,
        });
        const req = makeRequest({ method: 'GET', path: '/health' });
        const result = await handler(req);
        expect(result).toEqual({ method: 'GET', path: '/health' });
    });
    it('injects null for unknown ParamType values', async () => {
        const controller = {
            async unknown(value) {
                return { injected: value };
            },
        };
        const paramsMeta = [{ index: 0, type: 9999 }];
        const handler = (0, createRouteHandler_1.createRouteHandler)({
            controllerInstance: controller,
            controllerName: 'UnknownController',
            methodName: 'unknown',
            params: paramsMeta,
        });
        const result = await handler(makeRequest());
        expect(result).toEqual({ injected: null });
    });
    it('throws validation errors for invalid DTO input', async () => {
        const controller = new UserController();
        const paramsMeta = [{ index: 0, type: metadata_1.ParamType.BODY, dto: TestBodyDto }];
        const handler = (0, createRouteHandler_1.createRouteHandler)({
            controllerInstance: controller,
            controllerName: UserController.name,
            methodName: 'createUser', // method takes more params, but we only test validation here
            params: paramsMeta,
        });
        const req = makeRequest({ body: { name: 123 } }); // invalid input type
        await expect(handler(req)).rejects.toThrow();
    });
});
