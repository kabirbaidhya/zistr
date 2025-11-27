import { BaseController, ControllerConstructor } from './BaseController';
import { getBasePath, getParams, getRoutes } from './decorators/metadata';
import { ParamMetadata, SupportedHttpMethod } from './types';
import { createRouteHandler, RouteHandlerFunction } from './createRouteHandler';

export class RouteDefinition {
  readonly path: string;
  readonly requestMethod: SupportedHttpMethod;
  readonly methodName: string;
  readonly params: readonly ParamMetadata[];
  readonly controllerName: string;
  readonly routeHandler: RouteHandlerFunction;

  constructor(options: {
    path: string;
    requestMethod: SupportedHttpMethod;
    methodName: string;
    controllerName: string;
    handler: RouteHandlerFunction;
    params: ParamMetadata[];
  }) {
    this.path = options.path;
    this.requestMethod = options.requestMethod;
    this.methodName = options.methodName;
    this.controllerName = options.controllerName;
    this.params = options.params;
    this.routeHandler = options.handler;
  }
}

const normalizePath = (path?: string): string => {
  if (!path) return '';
  return '/' + path.replace(/^\/+|\/+$/g, '');
};

// Internal instance map
const controllerInstanceMap = new Map<ControllerConstructor<any>, BaseController>();

// Singleton instance getter
function getControllerInstance<T extends BaseController>(cls: ControllerConstructor<T>): T {
  let instance = controllerInstanceMap.get(cls) as T | undefined;

  if (!instance) {
    instance = new cls();
    controllerInstanceMap.set(cls, instance);
  }

  return instance;
}

/**
 * Get the route definitions from a list of controllers.
 *
 * @param controllerClasses - An array of controller classes, that extends BaseController.
 * @returns A list of routes defined by the provided controllers.
 */
export function getRouteDefinitions<T extends readonly ControllerConstructor<BaseController>[]>(
  controllerClasses: T
): RouteDefinition[] {
  return controllerClasses.flatMap((controllerClass) => {
    const routes = getRoutes(controllerClass) || [];
    const controllerInstance = getControllerInstance(controllerClass);
    const routeDefinitions: RouteDefinition[] = [];

    for (const route of routes) {
      const { methodName } = route;
      const params: ParamMetadata[] = getParams(controllerClass.prototype, methodName) || [];

      const basePath = normalizePath(getBasePath(controllerClass));
      const routePath = normalizePath(route.path);
      // combine safely, handle root correctly
      const fullPath = (basePath === '/' ? '' : basePath) + (routePath === '/' ? '' : routePath) || '/';

      routeDefinitions.push(
        new RouteDefinition({
          path: fullPath,
          requestMethod: route.requestMethod,
          methodName: methodName.toString(),
          params,
          controllerName: (controllerClass as any).name,
          handler: createRouteHandler({
            controllerInstance,
            controllerName: controllerClass.name,
            methodName,
            params,
          }),
        })
      );
    }

    return routeDefinitions;
  });
}
