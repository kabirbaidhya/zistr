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
require("reflect-metadata");
const decorators_1 = require("./decorators");
const getRouteDefinitions_1 = require("./getRouteDefinitions");
const BaseDto_1 = require("./BaseDto");
const metadata_1 = require("./decorators/metadata");
const BaseController_1 = require("./BaseController");
describe('getRouteDefinitions', () => {
    it('should return empty array if no routes are defined', () => {
        let EmptyController = class EmptyController extends BaseController_1.BaseController {
        };
        EmptyController = __decorate([
            (0, decorators_1.Controller)('/empty')
        ], EmptyController);
        const routes = (0, getRouteDefinitions_1.getRouteDefinitions)([EmptyController]);
        expect(routes).toEqual([]);
    });
    it('should return route info for a simple method decorator', () => {
        let SimpleController = class SimpleController extends BaseController_1.BaseController {
            sayHello() { }
        };
        __decorate([
            (0, decorators_1.Get)('/hello'),
            __metadata("design:type", Function),
            __metadata("design:paramtypes", []),
            __metadata("design:returntype", void 0)
        ], SimpleController.prototype, "sayHello", null);
        SimpleController = __decorate([
            (0, decorators_1.Controller)('/api')
        ], SimpleController);
        const routes = (0, getRouteDefinitions_1.getRouteDefinitions)([SimpleController]);
        expect(routes).toHaveLength(1);
        expect(routes).toMatchSnapshot();
    });
    it('should handle general param decorators', () => {
        let TestController = class TestController extends BaseController_1.BaseController {
            getHello(_req) { }
            postHello(_context) { }
        };
        __decorate([
            (0, decorators_1.Get)('/hello'),
            __param(0, (0, decorators_1.Req)()),
            __metadata("design:type", Function),
            __metadata("design:paramtypes", [Request]),
            __metadata("design:returntype", void 0)
        ], TestController.prototype, "getHello", null);
        __decorate([
            (0, decorators_1.Post)('/hello'),
            __param(0, (0, decorators_1.ReqContext)()),
            __metadata("design:type", Function),
            __metadata("design:paramtypes", [Object]),
            __metadata("design:returntype", void 0)
        ], TestController.prototype, "postHello", null);
        TestController = __decorate([
            (0, decorators_1.Controller)('/api')
        ], TestController);
        const routes = (0, getRouteDefinitions_1.getRouteDefinitions)([TestController]);
        expect(routes).toHaveLength(2);
        expect(routes).toMatchSnapshot();
    });
    it('should handle method decorator along with parameter decorators and DTOs', () => {
        class MyBodyDto extends BaseDto_1.BaseDto {
            getSchema() {
                return { parse: (data) => data };
            }
        }
        class MyQueryDto extends BaseDto_1.BaseDto {
            getSchema() {
                return { parse: (data) => data };
            }
        }
        let MultiParamController = class MultiParamController extends BaseController_1.BaseController {
            multiParams(_body, _query, _params) { }
        };
        __decorate([
            (0, decorators_1.Post)('/'),
            __param(0, (0, decorators_1.ReqBody)()),
            __param(1, (0, decorators_1.Query)()),
            __param(2, (0, decorators_1.Params)()),
            __metadata("design:type", Function),
            __metadata("design:paramtypes", [MyBodyDto, MyQueryDto, Object]),
            __metadata("design:returntype", void 0)
        ], MultiParamController.prototype, "multiParams", null);
        MultiParamController = __decorate([
            (0, decorators_1.Controller)('/api')
        ], MultiParamController);
        const routes = (0, getRouteDefinitions_1.getRouteDefinitions)([MultiParamController]);
        expect(routes).toHaveLength(1);
        const route = routes[0];
        expect(route.path).toBe('/api');
        expect(route.requestMethod).toBe('post');
        expect(route.methodName).toBe('multiParams');
        expect(route.controllerName).toBe('MultiParamController');
        expect(route.routeHandler).toEqual(expect.any(Function));
        expect(route.params).toHaveLength(3);
        expect(route.params).toEqual([
            { index: 2, type: metadata_1.ParamType.PARAMS, dto: undefined },
            { index: 1, type: metadata_1.ParamType.QUERY, dto: MyQueryDto },
            { index: 0, type: metadata_1.ParamType.BODY, dto: MyBodyDto },
        ]);
    });
});
