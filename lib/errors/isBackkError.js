"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const BackkError_1 = require("../types/BackkError");
function isBackkError(error) {
    return error[BackkError_1.backkErrorSymbol];
}
exports.default = isBackkError;
//# sourceMappingURL=isBackkError.js.map