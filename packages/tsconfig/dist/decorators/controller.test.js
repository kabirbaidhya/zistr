"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const controller_1 = require("./controller");
const metadata_1 = require("./metadata");
describe('Decorators: Controller', () => {
    it('should store base path metadata on controller class', () => {
        let MyController = class MyController {
        };
        MyController = __decorate([
            (0, controller_1.Controller)('/api')
        ], MyController);
        const basePath = (0, metadata_1.getBasePath)(MyController);
        expect(basePath).toBe('/api');
    });
    it('should initialize routes metadata on controller if not present', () => {
        let MyController = class MyController {
        };
        MyController = __decorate([
            (0, controller_1.Controller)('/api')
        ], MyController);
        const routes = (0, metadata_1.getRoutes)(MyController);
        expect(routes).toEqual([]);
    });
});
