"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const createBackkErrorFromErrorCodeMessageAndStatus_1 = __importDefault(require("../errors/createBackkErrorFromErrorCodeMessageAndStatus"));
const backkErrors_1 = require("../errors/backkErrors");
function assertIsColumnName(propertyName, columnName) {
    if (columnName.match(/^[a-zA-Z_][a-zA-Z0-9_.]*$/) == null) {
        throw createBackkErrorFromErrorCodeMessageAndStatus_1.default({
            ...backkErrors_1.BACKK_ERRORS.INVALID_ARGUMENT,
            message: backkErrors_1.BACKK_ERRORS.INVALID_ARGUMENT.message +
                `value ${columnName} in ${propertyName} property is not a valid column name`
        });
    }
}
exports.default = assertIsColumnName;
//# sourceMappingURL=assertIsColumnName.js.map