"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const typePropertyAnnotationContainer_1 = __importDefault(require("../../decorators/typeproperty/typePropertyAnnotationContainer"));
const getTypeInfoForTypeName_1 = __importDefault(require("../../utils/type/getTypeInfoForTypeName"));
const isEntityTypeName_1 = __importDefault(require("../../utils/type/isEntityTypeName"));
const getClassPropertyNameToPropertyTypeNameMap_1 = __importDefault(require("../../metadata/getClassPropertyNameToPropertyTypeNameMap"));
const setClassPropertyValidationDecorators_1 = require("../../validation/setClassPropertyValidationDecorators");
function handleNestedOneToManyRelations(entity, Types, EntityClass, subEntityPath) {
    const entityMetadata = getClassPropertyNameToPropertyTypeNameMap_1.default(EntityClass);
    Object.entries(entityMetadata).forEach(([fieldName, fieldTypeName]) => {
        if (typePropertyAnnotationContainer_1.default.isTypePropertyTransient(EntityClass, fieldName)) {
            delete entity[fieldName];
        }
        const { baseTypeName, isArrayType } = getTypeInfoForTypeName_1.default(fieldTypeName);
        const fieldPathName = subEntityPath + '.' + fieldName;
        if (entity[subEntityPath] !== undefined &&
            entity[subEntityPath].length > 0 &&
            !setClassPropertyValidationDecorators_1.doesClassPropertyContainCustomValidation(EntityClass, fieldName, 'isUndefined')) {
            entity[subEntityPath].forEach((subEntity) => {
                const arrayIndex = subEntity.id;
                Object.entries(subEntity).forEach(([fieldName, fieldValue]) => {
                    if (fieldName !== 'id') {
                        entity[`${subEntityPath}.${arrayIndex}.${fieldName}`] = fieldValue;
                    }
                });
            });
        }
        if (isArrayType &&
            isEntityTypeName_1.default(baseTypeName) &&
            !typePropertyAnnotationContainer_1.default.isTypePropertyManyToMany(EntityClass, fieldName)) {
            handleNestedOneToManyRelations(entity, Types, Types[baseTypeName], fieldPathName);
        }
        if ((entity[subEntityPath] !== undefined && entity[subEntityPath].length > 0) ||
            setClassPropertyValidationDecorators_1.doesClassPropertyContainCustomValidation(EntityClass, fieldName, 'isUndefined')) {
            delete entity[subEntityPath];
        }
    });
}
exports.default = handleNestedOneToManyRelations;
//# sourceMappingURL=handleNestedOneToManyRelations.js.map