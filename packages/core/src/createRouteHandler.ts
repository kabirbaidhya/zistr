/* eslint-disable @typescript-eslint/no-explicit-any */
import debug from 'debug';
import { BaseController, ControllerResult, RequestControllerMethod } from './BaseController';
import { DEBUG_CORE_EXECUTION } from './constants';
import { ParamMetadata } from './types';
import { ZistrRequest } from './ZistrRequest';
import { BaseDto } from './BaseDto';
import { ParamType } from './decorators/metadata';

export type RouteHandlerFunction = (req: ZistrRequest) => Promise<ControllerResult>;
export type RouteHandlerOptions<T extends BaseController> = {
  controllerInstance: T;
  controllerName: string;
  methodName: string | symbol;
  params: ParamMetadata[];
};

type InjectedParamValue = ZistrRequest | ZistrRequest['context'] | Record<string, unknown> | BaseDto | unknown | null;

const debugLog = debug(DEBUG_CORE_EXECUTION);

const isDataContainingParam = (type: ParamType): boolean =>
  [ParamType.BODY, ParamType.PARAMS, ParamType.QUERY].includes(type);

const mapRawValueForInjection = (req: ZistrRequest, type: ParamType): InjectedParamValue => {
  switch (type) {
    case ParamType.BODY:
      return req.body;

    case ParamType.PARAMS:
      return req.params;

    case ParamType.QUERY:
      return req.query;

    case ParamType.REQUEST:
      return req;

    case ParamType.REQUEST_CONTEXT:
      return req.context;

    default:
      return null;
  }
};

const buildArgsForInjection = (req: ZistrRequest, paramsMeta: ParamMetadata[]): InjectedParamValue[] => {
  const args: InjectedParamValue[] = [];
  for (const meta of paramsMeta) {
    const value = mapRawValueForInjection(req, meta.type);

    // If it's a data-containing param and DTO class exists,
    // hydrate the object and validate before injecting.
    if (isDataContainingParam(meta.type) && meta.dto && meta.dto.prototype instanceof BaseDto) {
      const dtoInstance = new meta.dto(value);
      dtoInstance.validate();
      args[meta.index] = dtoInstance;
    } else {
      args[meta.index] = value;
    }
  }

  return args;
};

/**
 * Create a route handler to handle incoming request
 * and execute the corresponding controller method.
 *
 * @returns A route handler function.
 */
export function createRouteHandler<T extends BaseController>(options: RouteHandlerOptions<T>): RouteHandlerFunction {
  return async (req: ZistrRequest) => {
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
    const controllerMethod = (options.controllerInstance as any)[options.methodName] as RequestControllerMethod;

    const result = await controllerMethod(...args);
    debugLog('returning result', result);

    return result;
  };
}
