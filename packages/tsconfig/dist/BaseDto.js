"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseDto = void 0;
class BaseDto {
    constructor(data) {
        if (data)
            Object.assign(this, data);
    }
    /**
     * Validate data based on the schema.
     */
    validate() {
        // Sub-class should override this method to provide validation logic.
    }
    static isDTO(fn) {
        if (typeof fn !== 'function')
            return false;
        return fn.prototype instanceof BaseDto;
    }
}
exports.BaseDto = BaseDto;
