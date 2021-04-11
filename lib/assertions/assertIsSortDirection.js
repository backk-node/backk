"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const createBackkErrorFromErrorCodeMessageAndStatus_1 = __importDefault(require("../errors/createBackkErrorFromErrorCodeMessageAndStatus"));
const backkErrors_1 = require("../errors/backkErrors");
function assertIsSortDirection(value) {
    if (value.toUpperCase() !== 'ASC' && value.toUpperCase() !== 'DESC') {
        throw createBackkErrorFromErrorCodeMessageAndStatus_1.default({
            ...backkErrors_1.BACKK_ERRORS.INVALID_ARGUMENT,
            message: backkErrors_1.BACKK_ERRORS.INVALID_ARGUMENT.message + `${value} in 'sortDirection' property is not a valid sort direction`
        });
    }
}
exports.default = assertIsSortDirection;
//# sourceMappingURL=assertIsSortDirection.js.map