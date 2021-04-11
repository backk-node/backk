"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const BackkError_1 = require("../types/BackkError");
const constants_1 = require("../constants/constants");
function createInternalServerError(errorMessage) {
    return {
        [BackkError_1.backkErrorSymbol]: true,
        message: errorMessage,
        statusCode: constants_1.HttpStatusCodes.INTERNAL_SERVER_ERROR
    };
}
exports.default = createInternalServerError;
//# sourceMappingURL=createInternalServerError.js.map