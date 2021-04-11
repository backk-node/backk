"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const getClassPropertyNameToPropertyTypeNameMap_1 = __importDefault(require("../../metadata/getClassPropertyNameToPropertyTypeNameMap"));
const getTypeInfoForTypeName_1 = __importDefault(require("./getTypeInfoForTypeName"));
const isEntityTypeName_1 = __importDefault(require("./isEntityTypeName"));
function findSubEntityClass(subEntityPath, EntityClass, Types, currentPath = '') {
    const entityPropertyNameToPropertyTypeNameMap = getClassPropertyNameToPropertyTypeNameMap_1.default(EntityClass);
    let SubEntityClass = undefined;
    Object.entries(entityPropertyNameToPropertyTypeNameMap).forEach(([propertyName, propertyTypeName]) => {
        const propertyPathName = currentPath ? currentPath + '.' + propertyName : propertyName;
        const { baseTypeName, isArrayType } = getTypeInfoForTypeName_1.default(propertyTypeName);
        if (propertyPathName === subEntityPath) {
            SubEntityClass = Types[baseTypeName];
        }
        if (!SubEntityClass && isArrayType && isEntityTypeName_1.default(baseTypeName)) {
            SubEntityClass = findSubEntityClass(subEntityPath, Types[baseTypeName], Types, propertyName);
        }
    });
    return SubEntityClass;
}
exports.default = findSubEntityClass;
//# sourceMappingURL=findSubEntityClass.js.map