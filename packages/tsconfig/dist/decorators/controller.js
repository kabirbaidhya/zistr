"use strict";
/* ------------------------------------------------------------------------------- */
/*                                Controller Decorators                            */
/* ------------------------------------------------------------------------------- */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Controller = Controller;
const metadata_1 = require("./metadata");
/**
 * Decorator to define a controller class.
 */
function Controller(basePath = '') {
    return (target) => {
        (0, metadata_1.setBasePath)(basePath, target);
    };
}
