"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("../constants/constants");
const BackkError_1 = require("../types/BackkError");
class BackkResponse {
    constructor() {
        this.statusCode = constants_1.HttpStatusCodes.INTERNAL_SERVER_ERROR;
        this.response = {};
    }
    status(statusCode) {
        this.statusCode = statusCode;
    }
    send(response) {
        this.response = response;
    }
    getStatusCode() {
        return this.statusCode;
    }
    getResponse() {
        return this.response;
    }
    getErrorResponse() {
        if (this.statusCode >= constants_1.HttpStatusCodes.ERRORS_START) {
            return {
                [BackkError_1.backkErrorSymbol]: true,
                statusCode: this.statusCode,
                errorCode: this.response.errorCode,
                stackTrace: this.response.stackTrace,
                message: this.response.message
            };
        }
        return null;
    }
}
exports.default = BackkResponse;
//# sourceMappingURL=BackkResponse.js.map