"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RouteDefinition = void 0;
exports.getRouteDefinitions = getRouteDefinitions;
const metadata_1 = require("./decorators/metadata");
const createRouteHandler_1 = require("./createRouteHandler");
class RouteDefinition {
    constructor(options) {
        this.path = options.path;
        this.requestMethod = options.requestMethod;
        this.methodName = options.methodName;
        this.controllerName = options.controllerName;
        this.params = options.params;
        this.routeHandler = options.handler;
    }
}
exports.RouteDefinition = RouteDefinition;
const normalizePath = (path) => {
    if (!path)
        return '';
    return '/' + path.replace(/^\/+|\/+$/g, '');
};
// Internal instance map
const controllerInstanceMap = new Map();
// Singleton instance getter
function getControllerInstance(cls) {
    let instance = controllerInstanceMap.get(cls);
    if (!instance) {
        instance = new cls();
        controllerInstanceMap.set(cls, instance);
    }
    return instance;
}
/**
 * Get the route definitions from a list of controllers.
 *
 * @param controllerClasses An array of controller classes, that extends BaseController.
 * @returns A list of routes defined by the provided controllers.
 */
function getRouteDefinitions(controllerClasses) {
    return controllerClasses.flatMap((controllerClass) => {
        const routes = (0, metadata_1.getRoutes)(controllerClass) || [];
        const controllerInstance = getControllerInstance(controllerClass);
        const routeDefinitions = [];
        for (const route of routes) {
            const { methodName } = route;
            const params = (0, metadata_1.getParams)(controllerClass.prototype, methodName) || [];
            const basePath = normalizePath((0, metadata_1.getBasePath)(controllerClass));
            const routePath = normalizePath(route.path);
            // combine safely, handle root correctly
            const fullPath = (basePath === '/' ? '' : basePath) + (routePath === '/' ? '' : routePath) || '/';
            routeDefinitions.push(new RouteDefinition({
                path: fullPath,
                requestMethod: route.requestMethod,
                methodName: methodName.toString(),
                params,
                controllerName: controllerClass.name,
                handler: (0, createRouteHandler_1.createRouteHandler)({
                    controllerInstance,
                    controllerName: controllerClass.name,
                    methodName,
                    params,
                }),
            }));
        }
        return routeDefinitions;
    });
}
