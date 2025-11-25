"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ZistrRequest_1 = require("./ZistrRequest");
describe('ZistrRequest', () => {
    const defaultInit = {
        method: 'GET',
        url: '/users/123?active=true',
        path: '/users/123',
        protocol: 'https',
        originalUrl: '/users/123?active=true',
        httpVersion: '1.1',
        cookies: { session: 'abc' },
        signedCookies: { signed: 'def' },
    };
    const minimalInit = {
        method: 'GET',
        url: '/',
        path: '/',
        protocol: 'http',
        originalUrl: '/',
        httpVersion: '1.1',
        cookies: {},
        signedCookies: {},
    };
    it('should initialize with mandatory fields', () => {
        const req = new ZistrRequest_1.ZistrRequest(defaultInit);
        expect(req.method).toBe('GET');
        expect(req.url).toBe('/users/123?active=true');
        expect(req.path).toBe('/users/123');
        expect(req.protocol).toBe('https');
        expect(req.originalUrl).toBe('/users/123?active=true');
        expect(req.httpVersion).toBe('1.1');
        expect(req.cookies).toEqual({ session: 'abc' });
        expect(req.signedCookies).toEqual({ signed: 'def' });
    });
    it('should default optional fields if not provided', () => {
        const req = new ZistrRequest_1.ZistrRequest(defaultInit);
        expect(req.headers).toEqual({});
        expect(req.body).toEqual(undefined);
        expect(req.query).toEqual({});
        expect(req.params).toEqual({});
        expect(req.context).toEqual({});
        expect(req.ip).toBeUndefined();
    });
    it('should correctly set optional fields when provided', () => {
        const req = new ZistrRequest_1.ZistrRequest({
            ...defaultInit,
            headers: { 'content-type': 'application/json' },
            body: { name: 'Alice' },
            query: { active: 'true' },
            params: { id: '123' },
            context: { user: { id: 'u1' } },
            ip: '127.0.0.1',
        });
        expect(req.headers['content-type']).toBe('application/json');
        expect(req.body).toEqual({ name: 'Alice' });
        expect(req.query).toEqual({ active: 'true' });
        expect(req.params).toEqual({ id: '123' });
        expect(req.context).toEqual({ user: { id: 'u1' } });
        expect(req.ip).toBe('127.0.0.1');
    });
    describe('getHeader()', () => {
        it('should return header value as string', () => {
            const req = new ZistrRequest_1.ZistrRequest({
                ...defaultInit,
                headers: { 'content-type': 'application/json' },
            });
            expect(req.getHeader('content-type')).toBe('application/json');
        });
        it('should be case-insensitive', () => {
            const req = new ZistrRequest_1.ZistrRequest({
                ...defaultInit,
                headers: { 'Content-Type': 'application/json' },
            });
            expect(req.getHeader('content-type')).toBe('application/json');
            expect(req.getHeader('CONTENT-TYPE')).toBe('application/json');
        });
        it('should return first value if header is an array', () => {
            const req = new ZistrRequest_1.ZistrRequest({
                ...defaultInit,
                headers: { 'x-test': ['a', 'b'] },
            });
            expect(req.getHeader('x-test')).toBe('a');
        });
        it('should return undefined if header not present', () => {
            const req = new ZistrRequest_1.ZistrRequest(defaultInit);
            expect(req.getHeader('missing')).toBeUndefined();
        });
    });
    // -----------------------------
    // Generics type safety tests
    // -----------------------------
    describe('generics type safety', () => {
        it('should allow strongly typed body, query, params, context', () => {
            const req = new ZistrRequest_1.ZistrRequest({
                ...defaultInit,
                body: { name: 'Alice' },
                query: { active: 'true' },
                params: { id: '123' },
                context: { userId: 'u1' },
            });
            // TypeScript enforces these types
            const bodyName = req.body.name;
            const queryActive = req.query.active;
            const paramId = req.params.id;
            const userId = req.context.userId;
            expect(bodyName).toBe('Alice');
            expect(queryActive).toBe('true');
            expect(paramId).toBe('123');
            expect(userId).toBe('u1');
        });
    });
    it('should initialize with minimal data', () => {
        const req = new ZistrRequest_1.ZistrRequest(minimalInit);
        expect(req.method).toBe('GET');
        expect(req.url).toBe('/');
        expect(req.path).toBe('/');
        expect(req.protocol).toBe('http');
        expect(req.originalUrl).toBe('/');
        expect(req.httpVersion).toBe('1.1');
        expect(req.cookies).toEqual({});
        expect(req.signedCookies).toEqual({});
        expect(req.headers).toEqual({});
        expect(req.body).toBeUndefined();
        expect(req.query).toEqual({});
        expect(req.params).toEqual({});
        expect(req.context).toEqual({});
        expect(req.ip).toBeUndefined();
    });
    it('should handle minimal HTML GET request with empty headers', () => {
        const req = new ZistrRequest_1.ZistrRequest({
            ...minimalInit,
            headers: {},
            body: undefined,
        });
        expect(req.getHeader('content-type')).toBeUndefined();
        expect(req.body).toBeUndefined();
        expect(req.query).toEqual({});
        expect(req.params).toEqual({});
    });
    it('should handle minimal request with only required attributes', () => {
        const req = new ZistrRequest_1.ZistrRequest({
            method: 'HEAD',
            url: '/minimal',
            path: '/minimal',
            protocol: 'http',
            originalUrl: '/minimal',
            httpVersion: '1.0',
            cookies: {},
            signedCookies: {},
        });
        expect(req.method).toBe('HEAD');
        expect(req.url).toBe('/minimal');
        expect(req.path).toBe('/minimal');
        expect(req.protocol).toBe('http');
        expect(req.originalUrl).toBe('/minimal');
        expect(req.httpVersion).toBe('1.0');
        expect(req.cookies).toEqual({});
        expect(req.signedCookies).toEqual({});
        expect(req.headers).toEqual({});
        expect(req.body).toBeUndefined();
        expect(req.query).toEqual({});
        expect(req.params).toEqual({});
        expect(req.context).toEqual({});
    });
    it('should allow empty strings in query and params', () => {
        const req = new ZistrRequest_1.ZistrRequest({
            ...minimalInit,
            query: { foo: '' },
            params: { id: '' },
        });
        expect(req.query.foo).toBe('');
        expect(req.params.id).toBe('');
    });
    it('should allow empty object for context', () => {
        const req = new ZistrRequest_1.ZistrRequest({
            ...minimalInit,
            context: {},
        });
        expect(req.context).toEqual({});
    });
    it('getHeader() should return undefined for missing headers in minimal request', () => {
        const req = new ZistrRequest_1.ZistrRequest(minimalInit);
        expect(req.getHeader('non-existent')).toBeUndefined();
    });
});
