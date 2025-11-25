"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addParam = exports.getParams = exports.setParams = exports.addRoute = exports.getRoutes = exports.setRoutes = exports.isBasePathSet = exports.getBasePath = exports.setBasePath = exports.ParamType = void 0;
exports.clearMetadata = clearMetadata;
/* eslint-disable @typescript-eslint/no-unsafe-function-type */
require("reflect-metadata");
const debug_1 = __importDefault(require("debug"));
const constants_1 = require("../constants");
const debugLog = (0, debug_1.default)(constants_1.DEBUG_CORE_META);
const ROUTES_KEY = Symbol('routes');
const PARAMS_KEY = Symbol('params');
const BASE_PATH_KEY = Symbol('basePath');
var ParamType;
(function (ParamType) {
    ParamType["BODY"] = "body";
    ParamType["PARAMS"] = "params";
    ParamType["QUERY"] = "query";
    ParamType["REQUEST"] = "request";
    ParamType["REQUEST_CONTEXT"] = "request_context";
})(ParamType || (exports.ParamType = ParamType = {}));
/*                                Base Path                                   */
/* -------------------------------------------------------------------------- */
const setBasePath = (basePath, target) => {
    Reflect.defineMetadata(BASE_PATH_KEY, basePath, target);
    debugLog(`set base path for ${target}`, { basePath });
};
exports.setBasePath = setBasePath;
const getBasePath = (target) => Reflect.getMetadata(BASE_PATH_KEY, target);
exports.getBasePath = getBasePath;
const isBasePathSet = (target) => Reflect.hasMetadata(ROUTES_KEY, target);
exports.isBasePathSet = isBasePathSet;
/*                                Routes                                      */
/* -------------------------------------------------------------------------- */
const setRoutes = (routes, target) => {
    Reflect.defineMetadata(ROUTES_KEY, routes, target);
    debugLog(`set routes for ${target}`, { routes });
};
exports.setRoutes = setRoutes;
const getRoutes = (target) => Reflect.getMetadata(ROUTES_KEY, target) || [];
exports.getRoutes = getRoutes;
const addRoute = (route, target) => {
    const routes = (0, exports.getRoutes)(target);
    routes.push(route);
    (0, exports.setRoutes)(routes, target);
};
exports.addRoute = addRoute;
/*                                Params                                      */
/* -------------------------------------------------------------------------- */
const setParams = (params, target, propertyKey) => {
    Reflect.defineMetadata(PARAMS_KEY, params, target, propertyKey);
    debugLog(`set params for ${String(propertyKey)}`, { params });
};
exports.setParams = setParams;
const getParams = (target, propertyKey) => Reflect.getMetadata(PARAMS_KEY, target, propertyKey) || [];
exports.getParams = getParams;
const addParam = (param, target, propertyKey) => {
    const params = (0, exports.getParams)(target, propertyKey);
    params.push(param);
    (0, exports.setParams)(params, target, propertyKey);
};
exports.addParam = addParam;
/*                                Misc                                        */
/* -------------------------------------------------------------------------- */
function clearMetadata(target) {
    // Class-level metadata
    Reflect.deleteMetadata(BASE_PATH_KEY, target);
    Reflect.deleteMetadata(ROUTES_KEY, target);
    // Method-level metadata (params)
    const propNames = Object.getOwnPropertyNames(target.prototype);
    for (const key of propNames) {
        Reflect.deleteMetadata(PARAMS_KEY, target.prototype, key);
    }
}
