"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const BackkError_1 = require("../types/BackkError");
const emptyError = {
    [BackkError_1.backkErrorSymbol]: true,
    statusCode: 500,
    message: 'Empty error'
};
exports.default = emptyError;
//# sourceMappingURL=emptyError.js.map