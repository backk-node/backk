"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const forEachAsyncSequential_1 = __importDefault(require("../../../../utils/forEachAsyncSequential"));
const entityAnnotationContainer_1 = __importDefault(require("../../../../decorators/entity/entityAnnotationContainer"));
const typePropertyAnnotationContainer_1 = __importDefault(require("../../../../decorators/typeproperty/typePropertyAnnotationContainer"));
const getEnumSqlColumnType_1 = __importDefault(require("./utils/getEnumSqlColumnType"));
const setSubEntityInfo_1 = __importDefault(require("./utils/setSubEntityInfo"));
const getSqlColumnType_1 = __importDefault(require("./utils/getSqlColumnType"));
const createArrayValuesTable_1 = __importDefault(require("./utils/createArrayValuesTable"));
const addArrayValuesTableJoinSpec_1 = __importDefault(require("./utils/addArrayValuesTableJoinSpec"));
const getClassPropertyNameToPropertyTypeNameMap_1 = __importDefault(require("../../../../metadata/getClassPropertyNameToPropertyTypeNameMap"));
const getTypeInfoForTypeName_1 = __importDefault(require("../../../../utils/type/getTypeInfoForTypeName"));
const isEntityTypeName_1 = __importDefault(require("../../../../utils/type/isEntityTypeName"));
const isEnumTypeName_1 = __importDefault(require("../../../../utils/type/isEnumTypeName"));
const typePropertyAnnotationContainer_2 = __importDefault(require("../../../../decorators/typeproperty/typePropertyAnnotationContainer"));
async function tryCreateTable(dbManager, entityName, EntityClass, schema, isPhysicalTable) {
    const entityMetadata = getClassPropertyNameToPropertyTypeNameMap_1.default(EntityClass);
    const tableName = entityName.toLowerCase();
    let createTableStatement = `CREATE TABLE ${schema === null || schema === void 0 ? void 0 : schema.toLowerCase()}.${tableName} (`;
    let fieldCnt = 0;
    const idColumnName = Object.keys(entityMetadata).find((fieldName) => fieldName === '_id' || fieldName === 'id');
    const _idColumnMetadata = idColumnName === 'id' ? { _id: 'string' } : {};
    await forEachAsyncSequential_1.default(Object.entries({ ...entityMetadata, ..._idColumnMetadata, ...(idColumnName ? {} : { id: 'string', _id: 'string' }) }), async ([fieldName, fieldTypeName]) => {
        if (typePropertyAnnotationContainer_2.default.isTypePropertyTransient(EntityClass, fieldName)) {
            return;
        }
        const { baseTypeName, isArrayType, isNullableType } = getTypeInfoForTypeName_1.default(fieldTypeName);
        let sqlColumnType;
        if (fieldName === '_id') {
            sqlColumnType = dbManager.getIdColumnType();
        }
        else {
            sqlColumnType = getSqlColumnType_1.default(dbManager, EntityClass, fieldName, baseTypeName);
        }
        if (!sqlColumnType && isEnumTypeName_1.default(baseTypeName)) {
            sqlColumnType = getEnumSqlColumnType_1.default(dbManager, baseTypeName);
        }
        if (!sqlColumnType && isEntityTypeName_1.default(baseTypeName)) {
            setSubEntityInfo_1.default(entityName, EntityClass, fieldName, baseTypeName, isArrayType);
        }
        else if (!isArrayType) {
            if (fieldCnt > 0) {
                createTableStatement += ', ';
            }
            const isUnique = typePropertyAnnotationContainer_1.default.isTypePropertyUnique(EntityClass, fieldName);
            createTableStatement +=
                fieldName.toLowerCase() +
                    ' ' +
                    sqlColumnType +
                    (isNullableType || fieldName === 'id' ? '' : ' NOT NULL') +
                    (isUnique ? ' UNIQUE' : '');
            fieldCnt++;
        }
    });
    if (isPhysicalTable) {
        await dbManager.tryExecuteSqlWithoutCls(createTableStatement +
            ')' +
            (entityAnnotationContainer_1.default.entityNameToAdditionalSqlCreateTableStatementOptionsMap[entityName]
                ? ' ' +
                    entityAnnotationContainer_1.default.entityNameToAdditionalSqlCreateTableStatementOptionsMap[entityName]
                : ''));
    }
    await forEachAsyncSequential_1.default(Object.entries({ ...entityMetadata, ...(idColumnName ? {} : { id: 'string' }) }), async ([fieldName, fieldTypeName]) => {
        if (typePropertyAnnotationContainer_2.default.isTypePropertyTransient(EntityClass, fieldName)) {
            return;
        }
        const { baseTypeName, isArrayType } = getTypeInfoForTypeName_1.default(fieldTypeName);
        let sqlColumnType;
        if (fieldName === '_id') {
            sqlColumnType = dbManager.getIdColumnType();
        }
        else {
            sqlColumnType = getSqlColumnType_1.default(dbManager, EntityClass, fieldName, baseTypeName);
        }
        if (!sqlColumnType && isEnumTypeName_1.default(baseTypeName)) {
            sqlColumnType = getEnumSqlColumnType_1.default(dbManager, baseTypeName);
        }
        if (!isEntityTypeName_1.default(baseTypeName) && isArrayType) {
            if (isPhysicalTable) {
                await createArrayValuesTable_1.default(schema, entityName, fieldName, sqlColumnType !== null && sqlColumnType !== void 0 ? sqlColumnType : '', dbManager);
            }
            const foreignIdFieldName = entityName.charAt(0).toLowerCase() + entityName.slice(1) + 'Id';
            addArrayValuesTableJoinSpec_1.default(entityName, fieldName, foreignIdFieldName);
        }
    });
}
exports.default = tryCreateTable;
//# sourceMappingURL=tryCreateTable.js.map