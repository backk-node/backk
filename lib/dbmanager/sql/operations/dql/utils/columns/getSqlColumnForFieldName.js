"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const tryGetProjection_1 = __importDefault(require("../../clauses/tryGetProjection"));
const getSqlColumnFromProjection_1 = __importDefault(require("./getSqlColumnFromProjection"));
const createErrorFromErrorCodeMessageAndStatus_1 = __importDefault(require("../../../../../../errors/createErrorFromErrorCodeMessageAndStatus"));
const backkErrors_1 = require("../../../../../../errors/backkErrors");
function tryGetSqlColumnForFieldName(fieldName, dbManager, entityClass, Types) {
    let projection;
    try {
        projection = tryGetProjection_1.default(dbManager, { includeResponseFields: [fieldName] }, entityClass, Types);
    }
    catch (error) {
        throw createErrorFromErrorCodeMessageAndStatus_1.default({
            ...backkErrors_1.BACKK_ERRORS.INVALID_ARGUMENT,
            message: backkErrors_1.BACKK_ERRORS.INVALID_ARGUMENT.message + 'invalid sub pagination field: ' + fieldName
        });
    }
    return getSqlColumnFromProjection_1.default(projection);
}
exports.default = tryGetSqlColumnForFieldName;
//# sourceMappingURL=getSqlColumnForFieldName.js.map