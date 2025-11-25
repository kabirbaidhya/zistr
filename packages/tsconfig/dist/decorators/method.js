"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Delete = exports.Patch = exports.Put = exports.Post = exports.Get = void 0;
const metadata_1 = require("./metadata");
function createMethodDecorator(requestMethod) {
    return (path = '') => {
        return (target, propertyKey) => {
            (0, metadata_1.addRoute)({ methodName: propertyKey, path, requestMethod }, target.constructor);
        };
    };
}
/* --------------------------------------------------------------------------- */
/*                                Method Decorators                            */
/* --------------------------------------------------------------------------- */
exports.Get = createMethodDecorator('get');
exports.Post = createMethodDecorator('post');
exports.Put = createMethodDecorator('put');
exports.Patch = createMethodDecorator('patch');
exports.Delete = createMethodDecorator('delete');
