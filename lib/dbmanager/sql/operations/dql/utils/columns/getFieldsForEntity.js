"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const getClassPropertyNameToPropertyTypeNameMap_1 = __importDefault(require("../../../../../../metadata/getClassPropertyNameToPropertyTypeNameMap"));
const typePropertyAnnotationContainer_1 = __importDefault(require("../../../../../../decorators/typeproperty/typePropertyAnnotationContainer"));
const shouldIncludeField_1 = __importDefault(require("./shouldIncludeField"));
const getTypeInfoForTypeName_1 = __importDefault(require("../../../../../../utils/type/getTypeInfoForTypeName"));
const isEntityTypeName_1 = __importDefault(require("../../../../../../utils/type/isEntityTypeName"));
function getFieldsForEntity(dbManager, fields, EntityClass, Types, projection, fieldPath, isInternalCall = false, tableAlias = EntityClass.name.toLowerCase()) {
    let entityPropertyNameToPropertyTypeNameMap = getClassPropertyNameToPropertyTypeNameMap_1.default(EntityClass);
    if (isInternalCall) {
        entityPropertyNameToPropertyTypeNameMap = {
            ...entityPropertyNameToPropertyTypeNameMap,
            _id: 'string'
        };
    }
    Object.entries(entityPropertyNameToPropertyTypeNameMap).forEach(([entityPropertyName, entityPropertyTypeName]) => {
        var _a, _b;
        if ((!isInternalCall &&
            typePropertyAnnotationContainer_1.default.isTypePropertyPrivate(EntityClass, entityPropertyName)) ||
            typePropertyAnnotationContainer_1.default.isTypePropertyTransient(EntityClass, entityPropertyName)) {
            return;
        }
        const { baseTypeName, isArrayType } = getTypeInfoForTypeName_1.default(entityPropertyTypeName);
        if (isEntityTypeName_1.default(baseTypeName)) {
            getFieldsForEntity(dbManager, fields, Types[baseTypeName], Types, projection, fieldPath + entityPropertyName + '.', isInternalCall, tableAlias + '_' + entityPropertyName.toLowerCase());
        }
        else if (isArrayType) {
            if (shouldIncludeField_1.default(entityPropertyName, fieldPath, projection) &&
                !((_b = (_a = projection.includeResponseFields) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.endsWith('._id'))) {
                const idFieldName = (EntityClass.name.charAt(0).toLowerCase() +
                    EntityClass.name.slice(1) +
                    'Id').toLowerCase();
                const relationEntityName = (tableAlias + '_' + entityPropertyName).toLowerCase();
                fields.push(`${dbManager.schema}_${relationEntityName}.${idFieldName} AS ${relationEntityName}_${idFieldName}`);
                const singularFieldName = entityPropertyName.slice(0, -1).toLowerCase();
                fields.push(`${dbManager.schema}_${relationEntityName}.${singularFieldName} AS ${relationEntityName}_${singularFieldName}`);
                fields.push(`${dbManager.schema}_${relationEntityName}.id AS ${relationEntityName}_id`);
            }
        }
        else {
            if (shouldIncludeField_1.default(entityPropertyName, fieldPath, projection)) {
                if (entityPropertyName === '_id' ||
                    entityPropertyName === 'id' ||
                    entityPropertyName.endsWith('Id')) {
                    fields.push(`CAST(${dbManager.schema}_${tableAlias}.${entityPropertyName.toLowerCase()} AS ${dbManager.getIdColumnCastType()}) AS ${tableAlias}_${entityPropertyName.toLowerCase()}`);
                }
                else {
                    fields.push(`${dbManager.schema}_${tableAlias}.${entityPropertyName.toLowerCase()} AS ${tableAlias}_${entityPropertyName.toLowerCase()}`);
                }
            }
        }
    });
}
exports.default = getFieldsForEntity;
//# sourceMappingURL=getFieldsForEntity.js.map