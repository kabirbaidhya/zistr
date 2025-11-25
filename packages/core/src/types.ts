import { BaseController } from './BaseController';
import { DtoSubClass } from './BaseDto';
import { ParamType } from './decorators/metadata';

export type SupportedHttpMethod = 'get' | 'post' | 'put' | 'patch' | 'delete';

// Type representing a constructable subclass of BaseController
export type ControllerClass<T extends BaseController = any> = new (...args: any[]) => T;

export interface RouteMetadata {
  methodName: string | symbol;
  path: string;
  requestMethod: SupportedHttpMethod;
}

export interface ParamMetadata {
  index: number;
  type: ParamType;
  dto?: DtoSubClass;
}
