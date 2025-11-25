/**
 * Base controller class.
 */
export abstract class BaseController {}

export interface ControllerResult<ResBody = any> {
  status: number;
  data: ResBody;
  contentType?: string;
}

export type ControllerConstructor<T extends BaseController> = new (...args: any[]) => T;
export type RequestControllerMethod = (...args: any[]) => Promise<ControllerResult>;
