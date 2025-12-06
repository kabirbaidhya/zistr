/**
 * Base controller class.
 */
export abstract class BaseController {}

// Phantom symbol to mark ControllerResult types
export const ControllerResultSymbol = Symbol.for('zistr.ControllerResult');

// Type-level wrapper with branding to make it detectable by the generator
export type ControllerResult<ResBody = any> = {
  data: ResBody; // <-- the actual response sits under 'data'
  status?: number;
  contentType?: string;
  __controllerResultBrand?: typeof ControllerResultSymbol; // phantom brand
};

export type ControllerConstructor<T extends BaseController> = new (...args: any[]) => T;
export type RequestControllerMethod = (...args: any[]) => Promise<ControllerResult>;
