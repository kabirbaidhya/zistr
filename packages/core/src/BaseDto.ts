export abstract class BaseDto<T = any> {
  constructor(data?: Partial<T>) {
    if (data) Object.assign(this, data);
  }

  /**
   * Validate data based on the schema.
   */
  validate(): void {
    // Sub-class should override this method to provide validation logic.
  }

  static isDTO(fn: any): boolean {
    if (typeof fn !== 'function') return false;
    return fn.prototype instanceof BaseDto;
  }
}

export type DtoSubClass = new (...args: any[]) => BaseDto<any>;
