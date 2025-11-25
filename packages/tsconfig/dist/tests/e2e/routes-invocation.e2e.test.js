"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable @typescript-eslint/no-explicit-any */
const index_1 = require("../../index");
const index_2 = require("../../index");
const TestRouteInvoker_1 = require("./helpers/TestRouteInvoker");
const stub_1 = require("./helpers/stub");
const routes = (0, index_2.getRouteDefinitions)([stub_1.OrdersController]);
const invoker = new TestRouteInvoker_1.TestRouteInvoker(routes);
describe('Core E2E: Routes Invocation', () => {
    it('Route Discovery: finds a route', async () => {
        const result = await invoker.invoke('get', '/orders', {});
        expect(result).toHaveProperty('query');
    });
    it('Route Invocation: no body/query/params', async () => {
        const result = await invoker.invoke('get', '/orders', {});
        expect(result).toHaveProperty('query');
    });
    it('Body Injection: valid DTO passes', async () => {
        const body = { item: 'Monitor', quantity: 3 };
        const result = await invoker.invoke('post', '/orders', { body });
        expect(result).toEqual({ created: true, data: body });
    });
    it('Body Injection: invalid DTO throws validation error', async () => {
        const invalidBody = { item: 'Monitor', quantity: 'five' };
        await expect(invoker.invoke('post', '/orders', { body: invalidBody })).rejects.toThrow('error ss dfd ');
    });
    it('Query Injection: query object passes', async () => {
        const result = await invoker.invoke('get', '/orders', { query: { search: 'laptop' } });
        expect(result).toEqual({ query: { search: 'laptop' } });
    });
    it('Params Injection: route params are injected', async () => {
        const result = await invoker.invoke('get', '/orders/:id', { params: { id: 'abc123' } });
        expect(result).toEqual({ id: 'abc123' });
    });
    it('Context Injection: context object is accessible', async () => {
        const context = { userId: 'user-007' };
        const result = await invoker.invoke('get', '/orders', { context });
        expect(result).toHaveProperty('query');
    });
    it('Headers / IP / protocol: passed into ZistrRequest', async () => {
        const headers = { 'x-custom': 'hello' };
        const result = await invoker.invoke('get', '/orders', { headers, ip: '1.2.3.4', protocol: 'https' });
        expect(result).toHaveProperty('query');
    });
    it('Optional DTO: empty request defaults', async () => {
        const result = await invoker.invoke('get', '/orders', {});
        expect(result).toHaveProperty('query');
    });
    it('Multiple Routes: each route works independently', async () => {
        const createBody = { item: 'Keyboard', quantity: 1 };
        const createRes = await invoker.invoke('post', '/orders', { body: createBody });
        expect(createRes).toEqual({ created: true, data: createBody });
        const getRes = await invoker.invoke('get', '/orders/:id', { params: { id: 'xyz' } });
        expect(getRes).toEqual({ id: 'xyz' });
        const updateRes = await invoker.invoke('put', '/orders/:id', { params: { id: 'xyz' }, body: { quantity: 10 } });
        expect(updateRes).toEqual({ id: 'xyz', updated: 10 });
        const deleteRes = await invoker.invoke('delete', '/orders/:id', { params: { id: '42' } });
        expect(deleteRes).toEqual({ id: '42', deleted: true });
    });
    it('Missing Route: throws error if route not found', async () => {
        await expect(invoker.invoke('get', '/non-existent', {})).rejects.toThrow(/No route found for \[GET\] \/non-existent/);
    });
    it('Error Propagation: controller throws error', async () => {
        class ErrorController {
            fail(_req) {
                throw new Error('Controller failure');
            }
        }
        __decorate([
            (0, index_1.Get)('/fail'),
            __metadata("design:type", Function),
            __metadata("design:paramtypes", [index_1.ZistrRequest]),
            __metadata("design:returntype", void 0)
        ], ErrorController.prototype, "fail", null);
        const errRoutes = (0, index_2.getRouteDefinitions)([ErrorController]);
        const errInvoker = new TestRouteInvoker_1.TestRouteInvoker(errRoutes);
        await expect(errInvoker.invoke('get', '/fail', {})).rejects.toThrow('Controller failure');
    });
});
