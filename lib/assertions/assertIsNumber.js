"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const createBackkErrorFromErrorCodeMessageAndStatus_1 = __importDefault(require("../errors/createBackkErrorFromErrorCodeMessageAndStatus"));
const backkErrors_1 = require("../errors/backkErrors");
function assertIsNumber(propertyName, value) {
    if (typeof value !== 'number') {
        throw createBackkErrorFromErrorCodeMessageAndStatus_1.default({
            ...backkErrors_1.BACKK_ERRORS.INVALID_ARGUMENT,
            message: backkErrors_1.BACKK_ERRORS.INVALID_ARGUMENT.message + `value ${value} in ${propertyName} property must be a number`
        });
    }
}
exports.default = assertIsNumber;
//# sourceMappingURL=assertIsNumber.js.map