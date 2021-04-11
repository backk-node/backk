"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function removeSingleSubEntitiesWithNullPropertiesInObject(object) {
    Object.entries(object).forEach(([key, value]) => {
        var _a, _b;
        if (typeof value === 'object' && !(value instanceof Date) && value !== null) {
            if (Array.isArray(value) && value.length > 0 && typeof value[0] === 'object') {
                value.forEach((subValue) => removeSingleSubEntitiesWithNullPropertiesInObject(subValue));
            }
            else {
                removeSingleSubEntitiesWithNullPropertiesInObject(value);
            }
        }
        if ((Array.isArray(value) && value.length === 1 && typeof value[0] === 'object') ||
            (typeof value === 'object' && !(value instanceof Date) && value !== null)) {
            const emptyValueCount = Object.values((_a = value[0]) !== null && _a !== void 0 ? _a : value).filter((subValue) => subValue === null || subValue === undefined || (Array.isArray(subValue) && subValue.length === 0)).length;
            if (emptyValueCount === Object.values((_b = value[0]) !== null && _b !== void 0 ? _b : value).length) {
                object[key] = Array.isArray(value) ? [] : null;
            }
        }
    });
}
function removeUndefinedIds(object) {
    Object.entries(object).forEach(([key, value]) => {
        if (key === 'id' && value === undefined) {
            delete object[key];
        }
        if (typeof value === 'object' && value !== null) {
            if (Array.isArray(value) && value.length > 0 && typeof value[0] === 'object') {
                value.forEach((subValue) => removeUndefinedIds(subValue));
            }
            else {
                removeUndefinedIds(value);
            }
        }
    });
}
function removeSingleSubEntitiesWithNullProperties(rows) {
    rows.forEach((row) => {
        removeSingleSubEntitiesWithNullPropertiesInObject(row);
    });
    if (rows.length > 0) {
        removeUndefinedIds(rows[0]);
    }
}
exports.default = removeSingleSubEntitiesWithNullProperties;
//# sourceMappingURL=removeSingleSubEntitiesWithNullProperties.js.map