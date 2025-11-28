import { BaseDto } from '../BaseDto';
import { addParam, ParamType } from './metadata';

function createDataParamDecorator(type: ParamType) {
  return (): ParameterDecorator => {
    return (target: object, propertyKey: string | symbol | undefined, parameterIndex: number) => {
      if (!propertyKey) throw new Error(`@${type.toLowerCase()} decorator can only be used on methods`);

      // Infer DTO class from TypeScript metadata
      const paramTypes: any[] = Reflect.getMetadata('design:paramtypes', target, propertyKey) || [];
      const dto =
        paramTypes[parameterIndex] && BaseDto.isDTO(paramTypes[parameterIndex])
          ? paramTypes[parameterIndex]
          : undefined;

      addParam({ index: parameterIndex, type, dto }, target, propertyKey);
    };
  };
}

function createGenericParamDecorator(type: ParamType) {
  return (): ParameterDecorator => {
    return (target: object, propertyKey: string | symbol | undefined, parameterIndex: number) => {
      if (!propertyKey) throw new Error(`@${type} decorator can only be used on methods`);

      addParam({ index: parameterIndex, type, dto: undefined }, target, propertyKey);
    };
  };
}

/* -------------------------------------------------------------------------- */
/*                           Parameter Decorators                             */
/* -------------------------------------------------------------------------- */

/**
 * Injects the request body into the decorated controller method parameter.
 * Typically used with DTO classes for validation.
 */
export const ReqBody = createDataParamDecorator(ParamType.BODY);

/**
 * Injects route parameters (e.g., from :id in the path) into the decorated controller method parameter.
 */
export const Params = createDataParamDecorator(ParamType.PARAMS);

/**
 * Injects query parameters (from the URL ?key=value) into the decorated controller method parameter.
 */
export const Query = createDataParamDecorator(ParamType.QUERY);

/**
 * Injects the raw HTTP request object (ZistrRequest) into the decorated controller method parameter.
 * Use this when you need access to headers, cookies, protocol, etc.
 */
export const Req = createGenericParamDecorator(ParamType.REQUEST);

/**
 * Injects a custom context object associated with the request.
 * Useful for passing application-specific data (like auth info) to controllers.
 */
export const ReqContext = createGenericParamDecorator(ParamType.REQUEST_CONTEXT);
