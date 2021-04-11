"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function getTypeInfoForTypeName(typeName) {
    let canBeError = false;
    if (typeName.startsWith('PromiseErrorOr<')) {
        canBeError = true;
        typeName = typeName.slice(15, -1);
    }
    const isOptionalType = typeName.startsWith('?');
    typeName = isOptionalType ? typeName.slice(1) : typeName;
    if (typeName.startsWith('(') && typeName.endsWith(')') && typeName.includes(' | null')) {
        typeName = typeName.slice(1, -1);
    }
    let defaultValueStr;
    [typeName, defaultValueStr] = typeName.split(' = ');
    let isArrayType = false;
    if (typeName.endsWith('[]')) {
        isArrayType = true;
        typeName = typeName.slice(0, -2);
    }
    else if (typeName.startsWith('Array<')) {
        isArrayType = true;
        typeName = typeName.slice(6, -1);
    }
    if (isArrayType && typeName.startsWith('(') && typeName.endsWith(')')) {
        typeName = typeName.slice(1, -1);
    }
    let isNullableType = false;
    if (typeName.endsWith(' | null')) {
        isNullableType = true;
        typeName = typeName.split(' | null')[0];
    }
    if (typeName.endsWith('[]') || typeName.startsWith('Array<')) {
        if (isNullableType) {
            throw new Error('Array type union with null type is not allowed, use empty array to denote a missing value.');
        }
        else if (isArrayType) {
            throw new Error('Multi-dimensional types not allowed');
        }
    }
    return {
        baseTypeName: typeName,
        isNull: typeName === 'null',
        canBeError,
        defaultValueStr,
        isArrayType,
        isNullableType,
        isOptionalType
    };
}
exports.default = getTypeInfoForTypeName;
//# sourceMappingURL=getTypeInfoForTypeName.js.map