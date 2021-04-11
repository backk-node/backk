"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const assertIsNumber_1 = __importDefault(require("../../../../../assertions/assertIsNumber"));
const createErrorFromErrorCodeMessageAndStatus_1 = __importDefault(require("../../../../../errors/createErrorFromErrorCodeMessageAndStatus"));
const backkErrors_1 = require("../../../../../errors/backkErrors");
function getPaginationClause(subEntityPath, paginations) {
    let limitAndOffsetStatement = '';
    let pagination = paginations.find((pagination) => pagination.subEntityPath === subEntityPath || (subEntityPath === '' && !pagination.subEntityPath));
    if (!pagination) {
        pagination = paginations.find((pagination) => pagination.subEntityPath === '*');
    }
    if (!pagination && subEntityPath === '') {
        throw createErrorFromErrorCodeMessageAndStatus_1.default({
            ...backkErrors_1.BACKK_ERRORS.INVALID_ARGUMENT,
            message: backkErrors_1.BACKK_ERRORS.INVALID_ARGUMENT.message + "missing pagination for root entity (subEntityPath: '')"
        });
    }
    if (pagination && pagination.pageSize !== Number.MAX_SAFE_INTEGER) {
        assertIsNumber_1.default('pageNumber', pagination.pageNumber);
        assertIsNumber_1.default('pageSize', pagination.pageSize);
        limitAndOffsetStatement = `LIMIT ${pagination.pageSize} OFFSET ${(pagination.pageNumber - 1) *
            pagination.pageSize}`;
    }
    return limitAndOffsetStatement;
}
exports.default = getPaginationClause;
//# sourceMappingURL=getPaginationClause.js.map