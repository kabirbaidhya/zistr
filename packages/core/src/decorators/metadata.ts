/* eslint-disable @typescript-eslint/no-unsafe-function-type */
import 'reflect-metadata';
import debug from 'debug';

import { ParamMetadata, RouteMetadata } from '../types';
import { DEBUG_CORE_META } from '../constants';

const debugLog = debug(DEBUG_CORE_META);

const ROUTES_KEY = Symbol('routes');
const PARAMS_KEY = Symbol('params');
const BASE_PATH_KEY = Symbol('basePath');

export enum ParamType {
  BODY = 'body',
  PARAMS = 'params',
  QUERY = 'query',
  REQUEST = 'request',
  REQUEST_CONTEXT = 'request_context',
}

/*                                Base Path                                   */
/* -------------------------------------------------------------------------- */

export const setBasePath = (basePath: string, target: object) => {
  Reflect.defineMetadata(BASE_PATH_KEY, basePath, target);
  debugLog(`set base path for ${target}`, { basePath });
};

export const getBasePath = (target: object): string | undefined => Reflect.getMetadata(BASE_PATH_KEY, target);

export const isBasePathSet = (target: object) => Reflect.hasMetadata(ROUTES_KEY, target);

/*                                Routes                                      */
/* -------------------------------------------------------------------------- */

export const setRoutes = (routes: RouteMetadata[], target: object) => {
  Reflect.defineMetadata(ROUTES_KEY, routes, target);
  debugLog(`set routes for ${target}`, { routes });
};

export const getRoutes = (target: object): RouteMetadata[] => Reflect.getMetadata(ROUTES_KEY, target) || [];

export const addRoute = (route: RouteMetadata, target: object) => {
  const routes = getRoutes(target);
  routes.push(route);
  setRoutes(routes, target);
};

/*                                Params                                      */
/* -------------------------------------------------------------------------- */

export const setParams = (params: ParamMetadata[], target: object, propertyKey: string | symbol) => {
  Reflect.defineMetadata(PARAMS_KEY, params, target, propertyKey);
  debugLog(`set params for ${String(propertyKey)}`, { params });
};

export const getParams = (target: object, propertyKey: string | symbol): ParamMetadata[] =>
  Reflect.getMetadata(PARAMS_KEY, target, propertyKey) || [];

export const addParam = (param: ParamMetadata, target: object, propertyKey: string | symbol) => {
  const params = getParams(target, propertyKey);
  params.push(param);
  setParams(params, target, propertyKey);
};

/*                                Misc                                        */
/* -------------------------------------------------------------------------- */

export function clearMetadata(target: Function) {
  // Class-level metadata
  Reflect.deleteMetadata(BASE_PATH_KEY, target);
  Reflect.deleteMetadata(ROUTES_KEY, target);

  // Method-level metadata (params)
  const propNames = Object.getOwnPropertyNames(target.prototype);
  for (const key of propNames) {
    Reflect.deleteMetadata(PARAMS_KEY, target.prototype, key);
  }
}
