"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const entityAnnotationContainer_1 = __importDefault(require("../../../../../decorators/entity/entityAnnotationContainer"));
const typePropertyAnnotationContainer_1 = __importDefault(require("../../../../../decorators/typeproperty/typePropertyAnnotationContainer"));
const setClassPropertyValidationDecorators_1 = require("../../../../../validation/setClassPropertyValidationDecorators");
const getSingularName_1 = __importDefault(require("../../../../../utils/getSingularName"));
function setSubEntityInfo(entityName, EntityClass, fieldName, subEntityName, isArrayType) {
    let tableName = entityName;
    if (entityAnnotationContainer_1.default.entityNameToTableNameMap[entityName]) {
        tableName = entityAnnotationContainer_1.default.entityNameToTableNameMap[entityName];
    }
    if (typePropertyAnnotationContainer_1.default.isTypePropertyManyToMany(EntityClass, fieldName)) {
        const manyToManyRelationTableSpec = {
            entityName,
            subEntityName,
            entityFieldName: fieldName,
            associationTableName: entityName + '_' + getSingularName_1.default(fieldName),
            entityForeignIdFieldName: tableName.charAt(0).toLowerCase() + tableName.slice(1) + 'Id',
            subEntityForeignIdFieldName: subEntityName.charAt(0).toLowerCase() + subEntityName.slice(1) + 'Id'
        };
        entityAnnotationContainer_1.default.manyToManyRelationTableSpecs.push(manyToManyRelationTableSpec);
    }
    else {
        const subEntityForeignIdFieldName = tableName.charAt(0).toLowerCase() + tableName.slice(1) + 'Id';
        if (entityAnnotationContainer_1.default.entityNameToForeignIdFieldNamesMap[subEntityName]) {
            entityAnnotationContainer_1.default.entityNameToForeignIdFieldNamesMap[subEntityName].push(subEntityForeignIdFieldName);
        }
        else {
            entityAnnotationContainer_1.default.entityNameToForeignIdFieldNamesMap[subEntityName] = [
                subEntityForeignIdFieldName
            ];
        }
        entityAnnotationContainer_1.default.entityNameToIsArrayMap[subEntityName] = isArrayType;
        const isReadonly = setClassPropertyValidationDecorators_1.doesClassPropertyContainCustomValidation(EntityClass, fieldName, 'isUndefined') &&
            typePropertyAnnotationContainer_1.default.isTypePropertyOneToMany(EntityClass, fieldName) &&
            typePropertyAnnotationContainer_1.default.isTypePropertyExternalServiceEntity(EntityClass, fieldName);
        const entityJoinSpec = {
            entityFieldName: fieldName,
            subEntityTableName: subEntityName,
            entityIdFieldName: '_id',
            subEntityForeignIdFieldName,
            isReadonly
        };
        if (entityAnnotationContainer_1.default.entityNameToJoinsMap[entityName]) {
            entityAnnotationContainer_1.default.entityNameToJoinsMap[entityName].push(entityJoinSpec);
        }
        else {
            entityAnnotationContainer_1.default.entityNameToJoinsMap[entityName] = [entityJoinSpec];
        }
    }
}
exports.default = setSubEntityInfo;
//# sourceMappingURL=setSubEntityInfo.js.map