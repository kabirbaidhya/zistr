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
const method_1 = require("./method");
const metadata_1 = require("./metadata");
describe('Decorators: Method', () => {
    it.each([
        ['get', method_1.Get],
        ['post', method_1.Post],
        ['put', method_1.Put],
        ['patch', method_1.Patch],
        ['delete', method_1.Delete],
    ])('should store route metadata for @%s decorator', (method, decorator) => {
        class TestController {
            myMethod() { }
        }
        __decorate([
            decorator('/path'),
            __metadata("design:type", Function),
            __metadata("design:paramtypes", []),
            __metadata("design:returntype", void 0)
        ], TestController.prototype, "myMethod", null);
        const routes = (0, metadata_1.getRoutes)(TestController);
        expect(routes).toHaveLength(1);
        expect(routes[0]).toEqual({
            methodName: 'myMethod',
            path: '/path',
            requestMethod: method,
        });
    });
    it('should support empty path default for route decorators', () => {
        class MyController {
            myRoute() { }
        }
        __decorate([
            (0, method_1.Get)(),
            __metadata("design:type", Function),
            __metadata("design:paramtypes", []),
            __metadata("design:returntype", void 0)
        ], MyController.prototype, "myRoute", null);
        const routes = (0, metadata_1.getRoutes)(MyController);
        expect(routes[0].path).toBe('');
    });
    it('should accumulate multiple route decorators on same controller', () => {
        class MultiParam {
            a() { }
            b() { }
        }
        __decorate([
            (0, method_1.Get)('/a'),
            __metadata("design:type", Function),
            __metadata("design:paramtypes", []),
            __metadata("design:returntype", void 0)
        ], MultiParam.prototype, "a", null);
        __decorate([
            (0, method_1.Post)('/b'),
            __metadata("design:type", Function),
            __metadata("design:paramtypes", []),
            __metadata("design:returntype", void 0)
        ], MultiParam.prototype, "b", null);
        const routes = (0, metadata_1.getRoutes)(MultiParam);
        expect(routes).toHaveLength(2);
        expect(routes.map((r) => r.path)).toEqual(['/a', '/b']);
    });
});
