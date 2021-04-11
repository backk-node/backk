"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const getIncludeFieldsMap_1 = __importDefault(require("./getIncludeFieldsMap"));
const getExcludeFieldsMap_1 = __importDefault(require("./getExcludeFieldsMap"));
const getFieldsFromGraphQlOrJson_1 = __importDefault(require("../../graphql/getFieldsFromGraphQlOrJson"));
const getDefaultIncludeFieldsMap_1 = __importDefault(require("./getDefaultIncludeFieldsMap"));
function getProjection(EntityClass, projection) {
    var _a, _b, _c, _d;
    let includeResponseFields = projection === null || projection === void 0 ? void 0 : projection.includeResponseFields;
    if ((_b = (_a = projection === null || projection === void 0 ? void 0 : projection.includeResponseFields) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.includes('{')) {
        includeResponseFields = getFieldsFromGraphQlOrJson_1.default(projection.includeResponseFields[0]);
    }
    let excludeResponseFields = projection === null || projection === void 0 ? void 0 : projection.excludeResponseFields;
    if ((_d = (_c = projection === null || projection === void 0 ? void 0 : projection.excludeResponseFields) === null || _c === void 0 ? void 0 : _c[0]) === null || _d === void 0 ? void 0 : _d.includes('{')) {
        excludeResponseFields = getFieldsFromGraphQlOrJson_1.default(projection.excludeResponseFields[0]);
    }
    let includeFieldsMap = getIncludeFieldsMap_1.default(includeResponseFields);
    if (!includeResponseFields || includeResponseFields.length === 0) {
        includeFieldsMap = getDefaultIncludeFieldsMap_1.default(EntityClass);
    }
    const excludeFieldsMap = getExcludeFieldsMap_1.default(excludeResponseFields);
    Object.keys(includeFieldsMap).forEach(includeFieldName => {
        if (excludeFieldsMap[includeFieldName] === 0) {
            delete includeFieldsMap[includeFieldName];
        }
    });
    return includeFieldsMap;
}
exports.default = getProjection;
//# sourceMappingURL=getProjection.js.map