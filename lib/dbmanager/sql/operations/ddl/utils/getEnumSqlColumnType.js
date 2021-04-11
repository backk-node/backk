"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const parseEnumValuesFromSrcFile_1 = __importDefault(require("../../../../../typescript/parser/parseEnumValuesFromSrcFile"));
const getSrcFilePathNameForTypeName_1 = __importDefault(require("../../../../../utils/file/getSrcFilePathNameForTypeName"));
function getEnumSqlColumnType(dbManager, baseFieldTypeName) {
    let enumValues;
    if (baseFieldTypeName[0] === '(') {
        enumValues = baseFieldTypeName.slice(1).split(/[|)]/);
    }
    else {
        enumValues = parseEnumValuesFromSrcFile_1.default(getSrcFilePathNameForTypeName_1.default(baseFieldTypeName));
    }
    const firstEnumValue = enumValues[0];
    if (firstEnumValue[0] === "'") {
        const enumValueLengths = enumValues.map((enumValue) => enumValue.length);
        const maxEnumValueLength = Math.max(...enumValueLengths);
        return dbManager.getVarCharType(maxEnumValueLength);
    }
    else {
        const hasFloat = enumValues.reduce((hasFloat, enumValue) => hasFloat || parseInt(enumValue, 10).toString().length !== enumValue.length, false);
        if (hasFloat) {
            return 'DOUBLE PRECISION';
        }
        else {
            return 'INTEGER';
        }
    }
}
exports.default = getEnumSqlColumnType;
//# sourceMappingURL=getEnumSqlColumnType.js.map