"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const getFieldsFromGraphQlOrJson_1 = __importDefault(require("../../../../../graphql/getFieldsFromGraphQlOrJson"));
const getFieldsForEntity_1 = __importDefault(require("../utils/columns/getFieldsForEntity"));
const createErrorMessageWithStatusCode_1 = __importDefault(require("../../../../../errors/createErrorMessageWithStatusCode"));
const constants_1 = require("../../../../../constants/constants");
function tryGetProjection(dbManager, projection, EntityClass, Types, isInternalCall = false) {
    var _a, _b, _c, _d;
    const fields = [];
    if ((_b = (_a = projection.includeResponseFields) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.includes('{')) {
        projection.includeResponseFields = getFieldsFromGraphQlOrJson_1.default(projection.includeResponseFields[0]);
    }
    if ((_d = (_c = projection.excludeResponseFields) === null || _c === void 0 ? void 0 : _c[0]) === null || _d === void 0 ? void 0 : _d.includes('{')) {
        projection.excludeResponseFields = getFieldsFromGraphQlOrJson_1.default(projection.excludeResponseFields[0]);
    }
    if (projection.includeResponseFields) {
        const fields = [];
        projection.includeResponseFields.forEach((includeResponseField) => {
            getFieldsForEntity_1.default(dbManager, fields, EntityClass, Types, { includeResponseFields: [includeResponseField] }, '', isInternalCall);
            if (fields.length === 0) {
                throw new Error(createErrorMessageWithStatusCode_1.default('Invalid field: ' + includeResponseField + ' in includeResponseFields', constants_1.HttpStatusCodes.BAD_REQUEST));
            }
        });
    }
    if (projection.excludeResponseFields) {
        const fields = [];
        projection.excludeResponseFields.forEach((excludeResponseField) => {
            getFieldsForEntity_1.default(dbManager, fields, EntityClass, Types, { includeResponseFields: [excludeResponseField] }, '', isInternalCall);
            if (fields.length === 0) {
                throw new Error(createErrorMessageWithStatusCode_1.default('Invalid field: ' + excludeResponseField + ' in excludeResponseFields', constants_1.HttpStatusCodes.BAD_REQUEST));
            }
        });
    }
    getFieldsForEntity_1.default(dbManager, fields, EntityClass, Types, projection, '', isInternalCall);
    return fields.join(', ');
}
exports.default = tryGetProjection;
//# sourceMappingURL=tryGetProjection.js.map