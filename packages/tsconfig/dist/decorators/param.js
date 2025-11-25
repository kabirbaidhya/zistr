"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReqContext = exports.Req = exports.Query = exports.Params = exports.ReqBody = void 0;
const BaseDto_1 = require("../BaseDto");
const metadata_1 = require("./metadata");
function createDataParamDecorator(type) {
    return () => {
        return (target, propertyKey, parameterIndex) => {
            if (!propertyKey)
                throw new Error(`@${type.toLowerCase()} decorator can only be used on methods`);
            // Infer DTO class from TypeScript metadata
            const paramTypes = Reflect.getMetadata('design:paramtypes', target, propertyKey) || [];
            const dto = paramTypes[parameterIndex] && BaseDto_1.BaseDto.isDTO(paramTypes[parameterIndex])
                ? paramTypes[parameterIndex]
                : undefined;
            (0, metadata_1.addParam)({ index: parameterIndex, type, dto }, target, propertyKey);
        };
    };
}
function createGenericParamDecorator(type) {
    return () => {
        return (target, propertyKey, parameterIndex) => {
            if (!propertyKey)
                throw new Error(`@${type} decorator can only be used on methods`);
            (0, metadata_1.addParam)({ index: parameterIndex, type, dto: undefined }, target, propertyKey);
        };
    };
}
/* -------------------------------------------------------------------------- */
/*                           Parameter Decorators                             */
/* -------------------------------------------------------------------------- */
// Data containing decorators
exports.ReqBody = createDataParamDecorator(metadata_1.ParamType.BODY);
exports.Params = createDataParamDecorator(metadata_1.ParamType.PARAMS);
exports.Query = createDataParamDecorator(metadata_1.ParamType.QUERY);
// Other decorators
exports.Req = createGenericParamDecorator(metadata_1.ParamType.REQUEST);
exports.ReqContext = createGenericParamDecorator(metadata_1.ParamType.REQUEST_CONTEXT);
