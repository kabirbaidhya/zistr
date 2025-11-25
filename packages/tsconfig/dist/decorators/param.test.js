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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
require("reflect-metadata");
const param_1 = require("./param");
const BaseDto_1 = require("../BaseDto");
const metadata_1 = require("./metadata");
class MyDto extends BaseDto_1.BaseDto {
    getSchema() {
        return { parse: (d) => d };
    }
}
describe('Decorators: Param', () => {
    it.each([
        [param_1.ReqBody, metadata_1.ParamType.BODY],
        [param_1.Params, metadata_1.ParamType.PARAMS],
        [param_1.Query, metadata_1.ParamType.QUERY],
    ])('should store parameter metadata for %p decorator with provided DTO class', (decorator, type) => {
        class TestController {
            myMethod(_param) { }
        }
        __decorate([
            __param(0, decorator()),
            __metadata("design:type", Function),
            __metadata("design:paramtypes", [MyDto]),
            __metadata("design:returntype", void 0)
        ], TestController.prototype, "myMethod", null);
        const params = (0, metadata_1.getParams)(TestController.prototype, 'myMethod');
        expect(params).toHaveLength(1);
        expect(params[0]).toEqual({ index: 0, type, dto: MyDto });
    });
    it.each([
        [param_1.ReqBody, metadata_1.ParamType.BODY],
        [param_1.Params, metadata_1.ParamType.PARAMS],
        [param_1.Query, metadata_1.ParamType.QUERY],
    ])('should store parameter metadata for %p decorator without DTO class for TS typed-objects', (decorator, type) => {
        class TestController {
            myMethodOne(_param) { }
            myMethodTwo(_param) { }
        }
        __decorate([
            __param(0, decorator()),
            __metadata("design:type", Function),
            __metadata("design:paramtypes", [MyDto]),
            __metadata("design:returntype", void 0)
        ], TestController.prototype, "myMethodOne", null);
        __decorate([
            __param(0, decorator()),
            __metadata("design:type", Function),
            __metadata("design:paramtypes", [Object]),
            __metadata("design:returntype", void 0)
        ], TestController.prototype, "myMethodTwo", null);
        const paramsOne = (0, metadata_1.getParams)(TestController.prototype, 'myMethodOne');
        expect(paramsOne).toEqual([{ index: 0, type, dto: MyDto }]);
        const paramsTwo = (0, metadata_1.getParams)(TestController.prototype, 'myMethodTwo');
        expect(paramsTwo).toEqual([{ index: 0, type, dto: undefined }]);
    });
    it.each([
        [param_1.ReqBody, metadata_1.ParamType.BODY],
        [param_1.Params, metadata_1.ParamType.PARAMS],
        [param_1.Query, metadata_1.ParamType.QUERY],
    ])('should store parameter metadata for %p decorator without DTO', (decorator, type) => {
        class TestController {
            myMethod(_param) { }
        }
        __decorate([
            __param(0, decorator()),
            __metadata("design:type", Function),
            __metadata("design:paramtypes", [Object]),
            __metadata("design:returntype", void 0)
        ], TestController.prototype, "myMethod", null);
        const params = (0, metadata_1.getParams)(TestController.prototype, 'myMethod');
        expect(params).toHaveLength(1);
        expect(params[0]).toEqual({ index: 0, type, dto: undefined });
    });
    it('should store parameter metadata for @Req decorator (no DTO)', () => {
        class TestController {
            myMethod(_req) { }
        }
        __decorate([
            __param(0, (0, param_1.Req)()),
            __metadata("design:type", Function),
            __metadata("design:paramtypes", [Object]),
            __metadata("design:returntype", void 0)
        ], TestController.prototype, "myMethod", null);
        const params = (0, metadata_1.getParams)(TestController.prototype, 'myMethod');
        expect(params).toHaveLength(1);
        expect(params[0]).toEqual({ index: 0, type: metadata_1.ParamType.REQUEST, dto: undefined });
    });
    it('should support multiple parameter decorators on same method', () => {
        class TestController {
            myMethod(_body, _query, _req) { }
        }
        __decorate([
            __param(0, (0, param_1.ReqBody)()),
            __param(1, (0, param_1.Query)()),
            __param(2, (0, param_1.Req)()),
            __metadata("design:type", Function),
            __metadata("design:paramtypes", [MyDto, Object, Object]),
            __metadata("design:returntype", void 0)
        ], TestController.prototype, "myMethod", null);
        const params = (0, metadata_1.getParams)(TestController.prototype, 'myMethod');
        expect(params).toHaveLength(3);
        expect(params).toStrictEqual([
            { index: 2, type: metadata_1.ParamType.REQUEST, dto: undefined },
            { index: 1, type: metadata_1.ParamType.QUERY, dto: undefined },
            { index: 0, type: metadata_1.ParamType.BODY, dto: MyDto },
        ]);
    });
    it('should support injecting DTO class with ReqBody', () => {
        class TestController {
            myMethodOne(_body) { }
            myMethodTwo(_body) { }
        }
        __decorate([
            __param(0, (0, param_1.ReqBody)()),
            __metadata("design:type", Function),
            __metadata("design:paramtypes", [MyDto]),
            __metadata("design:returntype", void 0)
        ], TestController.prototype, "myMethodOne", null);
        __decorate([
            __param(0, (0, param_1.ReqBody)()),
            __metadata("design:type", Function),
            __metadata("design:paramtypes", [Object]),
            __metadata("design:returntype", void 0)
        ], TestController.prototype, "myMethodTwo", null);
        const params1 = (0, metadata_1.getParams)(TestController.prototype, 'myMethodOne');
        expect(params1).toStrictEqual([{ index: 0, type: metadata_1.ParamType.BODY, dto: MyDto }]);
        const params2 = (0, metadata_1.getParams)(TestController.prototype, 'myMethodTwo');
        expect(params2).toStrictEqual([{ index: 0, type: metadata_1.ParamType.BODY, dto: undefined }]);
    });
    it('should throw when used on non-method property', () => {
        const decorator = (0, param_1.ReqBody)();
        expect(() => decorator({}, undefined, 0)).toThrow('@body decorator can only be used on methods');
    });
});
