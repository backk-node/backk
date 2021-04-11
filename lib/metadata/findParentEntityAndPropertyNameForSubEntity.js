"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const getClassPropertyNameToPropertyTypeNameMap_1 = __importDefault(require("./getClassPropertyNameToPropertyTypeNameMap"));
const isEntityTypeName_1 = __importDefault(require("../utils/type/isEntityTypeName"));
const getTypeInfoForTypeName_1 = __importDefault(require("../utils/type/getTypeInfoForTypeName"));
const entityAnnotationContainer_1 = __importDefault(require("../decorators/entity/entityAnnotationContainer"));
function findParentEntityAndPropertyNameForSubEntity(EntityClass, SubEntityClass, Types) {
    const entityPropertyNameToPropertyTypeNameMap = getClassPropertyNameToPropertyTypeNameMap_1.default(EntityClass);
    const foundPropertyEntry = Object.entries(entityPropertyNameToPropertyTypeNameMap).find(([, propertyTypeName]) => getTypeInfoForTypeName_1.default(propertyTypeName).baseTypeName === SubEntityClass.name ||
        Object.entries(entityAnnotationContainer_1.default.entityNameToTableNameMap).find(([entityName, tableName]) => getTypeInfoForTypeName_1.default(propertyTypeName).baseTypeName === entityName &&
            SubEntityClass.name === tableName));
    if (foundPropertyEntry) {
        return [EntityClass, foundPropertyEntry[0]];
    }
    return Object.entries(entityPropertyNameToPropertyTypeNameMap).reduce((foundPropertyName, [, propertyTypeName]) => {
        const { baseTypeName } = getTypeInfoForTypeName_1.default(propertyTypeName);
        if (isEntityTypeName_1.default(baseTypeName)) {
            return (foundPropertyName ||
                findParentEntityAndPropertyNameForSubEntity(Types[baseTypeName], SubEntityClass, Types));
        }
        return foundPropertyName;
    }, undefined);
}
exports.default = findParentEntityAndPropertyNameForSubEntity;
//# sourceMappingURL=findParentEntityAndPropertyNameForSubEntity.js.map