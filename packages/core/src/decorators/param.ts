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

// Data containing decorators
export const ReqBody = createDataParamDecorator(ParamType.BODY);
export const Params = createDataParamDecorator(ParamType.PARAMS);
export const Query = createDataParamDecorator(ParamType.QUERY);

// Other decorators
export const Req = createGenericParamDecorator(ParamType.REQUEST);
export const ReqContext = createGenericParamDecorator(ParamType.REQUEST_CONTEXT);
