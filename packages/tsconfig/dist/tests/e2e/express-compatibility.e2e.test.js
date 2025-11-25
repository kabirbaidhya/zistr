"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable @typescript-eslint/no-explicit-any */
const supertest_1 = __importDefault(require("supertest"));
const express_1 = __importStar(require("express"));
const index_1 = require("../../index");
function mapExpressRequestToZistr(req) {
    return new index_1.ZistrRequest({
        method: req.method,
        url: req.url,
        path: req.path,
        protocol: req.protocol,
        originalUrl: req.originalUrl,
        httpVersion: req.httpVersion,
        headers: req.headers,
        ip: req.ip,
        body: req.body,
        query: req.query,
        params: req.params,
        context: req.context ?? {},
        cookies: req.cookies ?? {},
        signedCookies: req.signedCookies ?? {},
    });
}
const stub_1 = require("./helpers/stub");
const setupTestApp = () => {
    const app = (0, express_1.default)();
    app.use((0, express_1.json)());
    const routes = (0, index_1.getRouteDefinitions)([stub_1.OrdersController]);
    const router = express_1.default.Router();
    // Attach all controller routes to Express using only the public API
    for (const route of routes) {
        const method = route.requestMethod;
        const path = route.path;
        router[method](path, async (req, res) => {
            try {
                const zReq = mapExpressRequestToZistr(req);
                const result = await route.routeHandler(zReq);
                // Allow controllers to return values directly
                res.status(200).json(result);
            }
            catch (error) {
                res.status(400).json({ error: error.message });
            }
        });
    }
    app.use(router);
    return app;
};
describe('E2E: Express Compatibility test', () => {
    let app;
    beforeAll(() => {
        app = setupTestApp();
    });
    it('Route Discovery & Query Injection', async () => {
        const res = await (0, supertest_1.default)(app).get('/orders?search=laptop');
        expect(res.status).toBe(200);
        expect(res.body).toEqual({ query: { search: 'laptop' } });
    });
    it('Body Injection: valid DTO', async () => {
        const res = await (0, supertest_1.default)(app).post('/orders').send({ item: 'Monitor', quantity: 3 });
        expect(res.status).toBe(200);
        expect(res.body).toEqual({ created: true, data: { item: 'Monitor', quantity: 3 } });
    });
    it('Body Injection: invalid DTO triggers validation error', async () => {
        const res = await (0, supertest_1.default)(app).post('/orders').send({ item: 'Monitor', quantity: 'five' });
        expect(res.status).toBe(400);
        expect(res.body).toHaveProperty('error');
    });
    it('Params Injection', async () => {
        const res = await (0, supertest_1.default)(app).get('/orders/abc123');
        expect(res.status).toBe(200);
        expect(res.body).toEqual({ id: 'abc123' });
    });
    it('Params + Body Injection', async () => {
        const res = await (0, supertest_1.default)(app).put('/orders/xyz').send({ quantity: 12 });
        expect(res.status).toBe(200);
        expect(res.body).toEqual({ id: 'xyz', updated: 12 });
    });
    it('DELETE route', async () => {
        const res = await (0, supertest_1.default)(app).delete('/orders/42');
        expect(res.status).toBe(200);
        expect(res.body).toEqual({ id: '42', deleted: true });
    });
    it('Context Injection (example)', async () => {
        const res = await (0, supertest_1.default)(app).get('/orders');
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('query');
    });
    it('Headers / IP / protocol', async () => {
        const res = await (0, supertest_1.default)(app).get('/orders').set('x-custom', 'abc').set('Host', 'localhost');
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('query');
    });
    it('Multiple routes work independently', async () => {
        const createRes = await (0, supertest_1.default)(app).post('/orders').send({ item: 'Keyboard', quantity: 1 });
        expect(createRes.status).toBe(200);
        expect(createRes.body).toEqual({ created: true, data: { item: 'Keyboard', quantity: 1 } });
        const getRes = await (0, supertest_1.default)(app).get('/orders/abc');
        expect(getRes.status).toBe(200);
    });
});
