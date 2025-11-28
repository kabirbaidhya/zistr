import { addRoute } from './metadata';
import { RouteMetadata } from '../types';

function createMethodDecorator(requestMethod: RouteMetadata['requestMethod']) {
  return (path: string = ''): MethodDecorator => {
    return (target: object, propertyKey: string | symbol, descriptor: PropertyDescriptor) => {
      addRoute({ methodName: propertyKey, path, requestMethod }, target.constructor);

      return descriptor;
    };
  };
}

/* --------------------------------------------------------------------------- */
/*                                Method Decorators                            */
/* --------------------------------------------------------------------------- */

/**
 * Handles HTTP GET requests for the decorated controller method.
 */
export const Get = createMethodDecorator('get');

/**
 * Handles HTTP POST requests for the decorated controller method.
 */
export const Post = createMethodDecorator('post');

/**
 * Handles HTTP PUT requests for the decorated controller method.
 */
export const Put = createMethodDecorator('put');

/**
 * Handles HTTP PATCH requests for the decorated controller method.
 */
export const Patch = createMethodDecorator('patch');

/**
 * Handles HTTP DELETE requests for the decorated controller method.
 */
export const Delete = createMethodDecorator('delete');
