"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function getIncludeFieldsMap(includeResponseFields) {
    return includeResponseFields
        ? includeResponseFields.reduce((includeFieldsMap, includeResponseField) => ({
            ...includeFieldsMap,
            [includeResponseField]: 1
        }), {})
        : {};
}
exports.default = getIncludeFieldsMap;
//# sourceMappingURL=getIncludeFieldsMap.js.map