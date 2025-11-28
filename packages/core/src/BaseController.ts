/**
 * Base controller class.
 */
export abstract class BaseController {}

export interface ControllerResult<ResBody = any> {
  data: ResBody;
  status?: number;
  contentType?: string;
}

export type ControllerConstructor<T extends BaseController> = new (...args: any[]) => T;
export type RequestControllerMethod = (...args: any[]) => Promise<ControllerResult>;
