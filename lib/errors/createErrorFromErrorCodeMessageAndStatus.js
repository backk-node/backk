"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("../constants/constants");
function createErrorFromErrorCodeMessageAndStatus(errorCodeMessageAndStatus) {
    var _a;
    return new Error(((_a = errorCodeMessageAndStatus.statusCode) !== null && _a !== void 0 ? _a : constants_1.HttpStatusCodes.INTERNAL_SERVER_ERROR) +
        ':Error code ' +
        errorCodeMessageAndStatus.errorCode +
        ':' +
        errorCodeMessageAndStatus.message);
}
exports.default = createErrorFromErrorCodeMessageAndStatus;
//# sourceMappingURL=createErrorFromErrorCodeMessageAndStatus.js.map