"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const getClassPropertyNameToPropertyTypeNameMap_1 = __importDefault(require("../../metadata/getClassPropertyNameToPropertyTypeNameMap"));
const testValueContainer_1 = __importDefault(require("../../decorators/typeproperty/testing/testValueContainer"));
const getValidationConstraint_1 = __importDefault(require("../../validation/getValidationConstraint"));
const getTypeInfoForTypeName_1 = __importDefault(require("../../utils/type/getTypeInfoForTypeName"));
const isEnumTypeName_1 = __importDefault(require("../../utils/type/isEnumTypeName"));
const parseEnumValuesFromSrcFile_1 = __importDefault(require("../../typescript/parser/parseEnumValuesFromSrcFile"));
const getCustomValidationConstraint_1 = __importDefault(require("../../validation/getCustomValidationConstraint"));
function getRemoteResponseTestValue(ResponseClass, types) {
    const sampleArg = {};
    Object.entries(getClassPropertyNameToPropertyTypeNameMap_1.default(ResponseClass)).forEach(([propertyName, propertyTypeName]) => {
        var _a;
        const { baseTypeName, defaultValueStr, isArrayType, isOptionalType } = getTypeInfoForTypeName_1.default(propertyTypeName);
        if (isOptionalType && defaultValueStr === undefined) {
            return;
        }
        const testValue = testValueContainer_1.default.getTestValue(ResponseClass, propertyName);
        const minValue = (_a = getValidationConstraint_1.default(ResponseClass, propertyName, 'min')) !== null && _a !== void 0 ? _a : getCustomValidationConstraint_1.default(ResponseClass, propertyName, 'minMax', 1);
        if (testValue !== undefined) {
            sampleArg[propertyName] = testValue;
        }
        else if (propertyName === '_id' || propertyName === 'id' || propertyName.endsWith('Id')) {
            sampleArg[propertyName] = '0';
        }
        else if (baseTypeName.startsWith('integer') || baseTypeName.startsWith('bigint')) {
            sampleArg[propertyName] = minValue;
        }
        else if (baseTypeName.startsWith('number')) {
            sampleArg[propertyName] = parseFloat(minValue.toFixed(2));
        }
        else if (baseTypeName.startsWith('boolean')) {
            sampleArg[propertyName] = true;
        }
        else if (baseTypeName.startsWith('string')) {
            sampleArg[propertyName] = 'abc';
        }
        else if (baseTypeName.startsWith('Date')) {
            sampleArg[propertyName] = `'${new Date(1).toISOString()}'`;
        }
        else if (isEnumTypeName_1.default(baseTypeName)) {
            let enumValues;
            if (baseTypeName.startsWith('(')) {
                enumValues = baseTypeName.slice(1).split(/[|)]/);
            }
            else {
                enumValues = parseEnumValuesFromSrcFile_1.default(baseTypeName);
            }
            sampleArg[propertyName] =
                enumValues[0][0] === "'"
                    ? enumValues[0].split("'")[1]
                    : enumValues[0].includes('.')
                        ? parseFloat(enumValues[0])
                        : parseInt(enumValues[0]);
        }
        else if (types === null || types === void 0 ? void 0 : types[propertyName]) {
            sampleArg[propertyName] = getRemoteResponseTestValue(types === null || types === void 0 ? void 0 : types[propertyName]);
        }
        if (isArrayType) {
            if (propertyName.endsWith('Ids') && testValue === undefined) {
                sampleArg[propertyName] = ['0'];
            }
            else {
                sampleArg[propertyName] =
                    defaultValueStr === undefined ? [sampleArg[propertyName]] : JSON.parse(defaultValueStr);
            }
        }
    });
    return sampleArg;
}
exports.default = getRemoteResponseTestValue;
//# sourceMappingURL=getRemoteResponseTestValue.js.map