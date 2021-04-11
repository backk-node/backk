"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const getClassPropertyNameToPropertyTypeNameMap_1 = __importDefault(require("../../metadata/getClassPropertyNameToPropertyTypeNameMap"));
const getTypeInfoForTypeName_1 = __importDefault(require("../../utils/type/getTypeInfoForTypeName"));
const isEntityTypeName_1 = __importDefault(require("../../utils/type/isEntityTypeName"));
const setClassPropertyValidationDecorators_1 = require("../../validation/setClassPropertyValidationDecorators");
const entityAnnotationContainer_1 = __importDefault(require("../../decorators/entity/entityAnnotationContainer"));
const typePropertyAnnotationContainer_1 = __importDefault(require("../../decorators/typeproperty/typePropertyAnnotationContainer"));
function setJoinSpec(entityName, EntityClass, fieldName, subEntityName) {
    const isReadonly = setClassPropertyValidationDecorators_1.doesClassPropertyContainCustomValidation(EntityClass, fieldName, 'isUndefined');
    if (isReadonly &&
        typePropertyAnnotationContainer_1.default.isTypePropertyOneToMany(EntityClass, fieldName) &&
        typePropertyAnnotationContainer_1.default.isTypePropertyExternalServiceEntity(EntityClass, fieldName)) {
        let subEntityTableName = subEntityName.toLowerCase();
        if (entityAnnotationContainer_1.default.entityNameToTableNameMap[subEntityName]) {
            subEntityTableName = entityAnnotationContainer_1.default.entityNameToTableNameMap[subEntityName].toLowerCase();
        }
        let entityTableName = entityName;
        if (entityAnnotationContainer_1.default.entityNameToTableNameMap[entityName]) {
            entityTableName = entityAnnotationContainer_1.default.entityNameToTableNameMap[entityName];
        }
        const subEntityForeignIdFieldName = entityTableName.charAt(0).toLowerCase() + entityTableName.slice(1) + 'Id';
        const entityJoinSpec = {
            EntityClass,
            isReadonly,
            entityFieldName: fieldName,
            subEntityTableName,
            entityIdFieldName: '_id',
            subEntityForeignIdFieldName,
            asFieldName: fieldName
        };
        if (entityAnnotationContainer_1.default.entityNameToJoinsMap[entityName]) {
            entityAnnotationContainer_1.default.entityNameToJoinsMap[entityName].push(entityJoinSpec);
        }
        else {
            entityAnnotationContainer_1.default.entityNameToJoinsMap[entityName] = [entityJoinSpec];
        }
    }
}
function setJoinSpecs(dbManager, entityName, EntityClass) {
    const entityMetadata = getClassPropertyNameToPropertyTypeNameMap_1.default(EntityClass);
    Object.entries(entityMetadata).forEach(([fieldName, fieldTypeName]) => {
        if (typePropertyAnnotationContainer_1.default.isTypePropertyTransient(EntityClass, fieldName)) {
            return;
        }
        const { baseTypeName } = getTypeInfoForTypeName_1.default(fieldTypeName);
        if (isEntityTypeName_1.default(baseTypeName)) {
            setJoinSpec(entityName, EntityClass, fieldName, baseTypeName);
        }
    });
}
exports.default = setJoinSpecs;
//# sourceMappingURL=setJoinSpecs.js.map