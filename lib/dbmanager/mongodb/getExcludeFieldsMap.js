"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function getExcludeFieldsMap(excludeResponseFields) {
    return excludeResponseFields
        ? excludeResponseFields.reduce((excludeFieldsMap, excludeResponseField) => ({
            ...excludeFieldsMap,
            [excludeResponseField]: 0
        }), {})
        : {};
}
exports.default = getExcludeFieldsMap;
//# sourceMappingURL=getExcludeFieldsMap.js.map