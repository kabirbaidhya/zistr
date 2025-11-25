import { addRoute } from './metadata';
import { RouteMetadata } from '../types';

function createMethodDecorator(requestMethod: RouteMetadata['requestMethod']) {
  return (path: string = ''): MethodDecorator => {
    return (target: object, propertyKey: string | symbol) => {
      addRoute({ methodName: propertyKey, path, requestMethod }, target.constructor);
    };
  };
}

/* --------------------------------------------------------------------------- */
/*                                Method Decorators                            */
/* --------------------------------------------------------------------------- */

export const Get = createMethodDecorator('get');
export const Post = createMethodDecorator('post');
export const Put = createMethodDecorator('put');
export const Patch = createMethodDecorator('patch');
export const Delete = createMethodDecorator('delete');
