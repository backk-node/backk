"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const getClassPropertyNameToPropertyTypeNameMap_1 = __importDefault(require("../../../../../metadata/getClassPropertyNameToPropertyTypeNameMap"));
const typePropertyAnnotationContainer_1 = __importDefault(require("../../../../../decorators/typeproperty/typePropertyAnnotationContainer"));
const isEntityTypeName_1 = __importDefault(require("../../../../../utils/type/isEntityTypeName"));
const getTypeInfoForTypeName_1 = __importDefault(require("../../../../../utils/type/getTypeInfoForTypeName"));
function isUniqueField(fieldPathName, EntityClass, Types, fieldPath = '') {
    const entityPropertyNameToPropertyTypeNameMap = getClassPropertyNameToPropertyTypeNameMap_1.default(EntityClass);
    return Object.entries(entityPropertyNameToPropertyTypeNameMap).reduce((isUniqueFieldResult, [propertyName, propertyTypeName]) => {
        if (propertyName === '_id' ||
            propertyName === 'id' ||
            propertyName.endsWith('Id') ||
            (fieldPath + propertyName === fieldPathName &&
                typePropertyAnnotationContainer_1.default.isTypePropertyUnique(EntityClass, propertyName))) {
            return true;
        }
        if (isEntityTypeName_1.default(propertyTypeName)) {
            const { baseTypeName } = getTypeInfoForTypeName_1.default(propertyTypeName);
            return (isUniqueFieldResult ||
                isUniqueField(fieldPathName, Types[baseTypeName], Types, fieldPath + propertyName + '.'));
        }
        return isUniqueFieldResult;
    }, false);
}
exports.default = isUniqueField;
//# sourceMappingURL=isUniqueField.js.map