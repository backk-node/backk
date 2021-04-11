"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const forEachAsyncParallel_1 = __importDefault(require("../../../../utils/forEachAsyncParallel"));
const typePropertyAnnotationContainer_1 = __importDefault(require("../../../../decorators/typeproperty/typePropertyAnnotationContainer"));
const getEnumSqlColumnType_1 = __importDefault(require("./utils/getEnumSqlColumnType"));
const getSqlColumnType_1 = __importDefault(require("./utils/getSqlColumnType"));
const setSubEntityInfo_1 = __importDefault(require("./utils/setSubEntityInfo"));
const createArrayValuesTable_1 = __importDefault(require("./utils/createArrayValuesTable"));
const addArrayValuesTableJoinSpec_1 = __importDefault(require("./utils/addArrayValuesTableJoinSpec"));
const getClassPropertyNameToPropertyTypeNameMap_1 = __importDefault(require("../../../../metadata/getClassPropertyNameToPropertyTypeNameMap"));
const getTypeInfoForTypeName_1 = __importDefault(require("../../../../utils/type/getTypeInfoForTypeName"));
const isEntityTypeName_1 = __importDefault(require("../../../../utils/type/isEntityTypeName"));
const isEnumTypeName_1 = __importDefault(require("../../../../utils/type/isEnumTypeName"));
const entityAnnotationContainer_1 = __importDefault(require("../../../../decorators/entity/entityAnnotationContainer"));
async function tryAlterTable(dbManager, entityName, EntityClass, schema, databaseFields) {
    const entityMetadata = getClassPropertyNameToPropertyTypeNameMap_1.default(EntityClass);
    await forEachAsyncParallel_1.default(Object.entries(entityMetadata), async ([fieldName, fieldTypeName]) => {
        if (typePropertyAnnotationContainer_1.default.isTypePropertyTransient(EntityClass, fieldName)) {
            return;
        }
        const doesFieldExistInDatabase = !!databaseFields.find((field) => field.name.toLowerCase() === fieldName.toLowerCase());
        if (!doesFieldExistInDatabase) {
            let tableName = entityName.toLowerCase();
            if (entityAnnotationContainer_1.default.entityNameToTableNameMap[entityName]) {
                tableName = entityAnnotationContainer_1.default.entityNameToTableNameMap[entityName].toLowerCase();
            }
            let alterTableStatement = `ALTER TABLE ${schema === null || schema === void 0 ? void 0 : schema.toLowerCase()}.${tableName} ADD `;
            const { baseTypeName, isArrayType } = getTypeInfoForTypeName_1.default(fieldTypeName);
            let sqlColumnType = getSqlColumnType_1.default(dbManager, EntityClass, fieldName, baseTypeName);
            if (!sqlColumnType && isEnumTypeName_1.default(baseTypeName)) {
                sqlColumnType = getEnumSqlColumnType_1.default(dbManager, baseTypeName);
            }
            if (!sqlColumnType && isEntityTypeName_1.default(baseTypeName)) {
                setSubEntityInfo_1.default(entityName, EntityClass, fieldName, baseTypeName, isArrayType);
            }
            else if (isArrayType) {
                await createArrayValuesTable_1.default(schema, entityName, fieldName, sqlColumnType !== null && sqlColumnType !== void 0 ? sqlColumnType : '', dbManager);
                const foreignIdFieldName = entityName.charAt(0).toLowerCase() + entityName.slice(1) + 'Id';
                addArrayValuesTableJoinSpec_1.default(entityName, fieldName, foreignIdFieldName);
            }
            else {
                const isUnique = typePropertyAnnotationContainer_1.default.isTypePropertyUnique(EntityClass, fieldName);
                alterTableStatement += fieldName.toLowerCase() + ' ' + sqlColumnType + (isUnique ? ' UNIQUE' : '');
                await dbManager.tryExecuteSqlWithoutCls(alterTableStatement);
            }
        }
        const { baseTypeName, isArrayType } = getTypeInfoForTypeName_1.default(fieldTypeName);
        const sqlColumnType = getSqlColumnType_1.default(dbManager, EntityClass, fieldName, baseTypeName);
        if (fieldName !== '_id' &&
            !isArrayType &&
            ((sqlColumnType === 'BIGINT' && fieldName !== 'id' && !fieldName.endsWith('Id')) || (sqlColumnType === null || sqlColumnType === void 0 ? void 0 : sqlColumnType.startsWith('VARCHAR')))) {
            let tableName = entityName.toLowerCase();
            if (entityAnnotationContainer_1.default.entityNameToTableNameMap[entityName]) {
                tableName = entityAnnotationContainer_1.default.entityNameToTableNameMap[entityName].toLowerCase();
            }
            const isUnique = typePropertyAnnotationContainer_1.default.isTypePropertyUnique(EntityClass, fieldName);
            const alterTableStatement = dbManager.getModifyColumnStatement(schema, tableName, fieldName, sqlColumnType, isUnique);
            await dbManager.tryExecuteSqlWithoutCls(alterTableStatement, undefined, true, false);
        }
    });
}
exports.default = tryAlterTable;
//# sourceMappingURL=tryAlterTable.js.map