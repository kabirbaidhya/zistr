"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ZistrRequest = void 0;
/**
 * Generic, lightweight, framework-agnostic HTTP request.
 */
class ZistrRequest {
    constructor(init) {
        this.method = init.method;
        this.url = init.url;
        this.path = init.path;
        this.protocol = init.protocol;
        this.ip = init.ip;
        // Normalize headers to lowercase keys
        this.headers = {};
        if (init.headers) {
            Object.entries(init.headers).forEach(([key, value]) => {
                this.headers[key.toLowerCase()] = value;
            });
        }
        this.body = init.body;
        this.query = init.query ?? {};
        this.params = init.params ?? {};
        this.context = init.context ?? {};
        this.originalUrl = init.originalUrl;
        this.httpVersion = init.httpVersion;
        this.cookies = init.cookies ?? {};
        this.signedCookies = init.signedCookies ?? {};
    }
    /**
     * Returns a header value by key.
     */
    getHeader(name) {
        const value = this.headers[name.toLowerCase()];
        if (Array.isArray(value))
            return value[0];
        return value ?? undefined;
    }
}
exports.ZistrRequest = ZistrRequest;
