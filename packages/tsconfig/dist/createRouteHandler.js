"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRouteHandler = createRouteHandler;
/* eslint-disable @typescript-eslint/no-explicit-any */
const debug_1 = __importDefault(require("debug"));
const constants_1 = require("./constants");
const BaseDto_1 = require("./BaseDto");
const metadata_1 = require("./decorators/metadata");
const debugLog = (0, debug_1.default)(constants_1.DEBUG_CORE_EXECUTION);
const isDataContainingParam = (type) => [metadata_1.ParamType.BODY, metadata_1.ParamType.PARAMS, metadata_1.ParamType.QUERY].includes(type);
const mapRawValueForInjection = (req, type) => {
    switch (type) {
        case metadata_1.ParamType.BODY:
            return req.body;
        case metadata_1.ParamType.PARAMS:
            return req.params;
        case metadata_1.ParamType.QUERY:
            return req.query;
        case metadata_1.ParamType.REQUEST:
            return req;
        case metadata_1.ParamType.REQUEST_CONTEXT:
            return req.context;
        default:
            return null;
    }
};
const buildArgsForInjection = (req, paramsMeta) => {
    const args = [];
    for (const meta of paramsMeta) {
        const value = mapRawValueForInjection(req, meta.type);
        // If it's a data-containing param and DTO class exists,
        // hydrate the object and validate before injecting.
        if (isDataContainingParam(meta.type) && meta.dto && meta.dto.prototype instanceof BaseDto_1.BaseDto) {
            const dtoInstance = new meta.dto(value);
            dtoInstance.validate();
            args[meta.index] = dtoInstance;
        }
        else {
            args[meta.index] = value;
        }
    }
    return args;
};
/**
 * Create a route handler to handle incoming request
 * and execute the corresponding controller method.
 *
 * @returns {RouteHandlerFunction}
 */
function createRouteHandler(options) {
    return async (req) => {
        debugLog('invoking route handler', {
            path: req?.path,
            httpMethod: req?.method,
            controllerClass: options.controllerName,
            controllerMethod: options.methodName,
            params: options.params,
            req,
        });
        const args = buildArgsForInjection(req, options.params);
        debugLog('invoking controller method', {
            controllerClass: options.controllerName,
            controllerMethod: options.methodName,
            args,
        });
        const controllerMethod = options.controllerInstance[options.methodName];
        const result = await controllerMethod(...args);
        debugLog('returning result', result);
        return result;
    };
}
