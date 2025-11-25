/* ------------------------------------------------------------------------------- */
/*                                Controller Decorators                            */
/* ------------------------------------------------------------------------------- */

import { setBasePath } from './metadata';

/**
 * Decorator to define a controller class.
 */
export function Controller(basePath: string = ''): ClassDecorator {
  return (target) => {
    setBasePath(basePath, target);
  };
}
