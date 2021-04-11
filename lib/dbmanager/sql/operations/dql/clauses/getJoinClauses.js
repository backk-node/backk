"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const entityAnnotationContainer_1 = __importDefault(require("../../../../../decorators/entity/entityAnnotationContainer"));
const getClassPropertyNameToPropertyTypeNameMap_1 = __importDefault(require("../../../../../metadata/getClassPropertyNameToPropertyTypeNameMap"));
const shouldIncludeField_1 = __importDefault(require("../utils/columns/shouldIncludeField"));
const getTypeInfoForTypeName_1 = __importDefault(require("../../../../../utils/type/getTypeInfoForTypeName"));
const isEntityTypeName_1 = __importDefault(require("../../../../../utils/type/isEntityTypeName"));
const tryGetWhereClause_1 = __importDefault(require("./tryGetWhereClause"));
const tryGetOrderByClause_1 = __importDefault(require("./tryGetOrderByClause"));
const getPaginationClause_1 = __importDefault(require("./getPaginationClause"));
const typePropertyAnnotationContainer_1 = __importDefault(require("../../../../../decorators/typeproperty/typePropertyAnnotationContainer"));
function getJoinClauses(dbManager, subEntityPath, projection, filters, sortBys, paginations, EntityClass, Types, resultOuterSortBys, isInternalCall, tableAliasPath = EntityClass.name.toLowerCase(), RootEntityClass = EntityClass) {
    let joinClauses = '';
    if (entityAnnotationContainer_1.default.entityNameToJoinsMap[EntityClass.name]) {
        const joinClauseParts = entityAnnotationContainer_1.default.entityNameToJoinsMap[EntityClass.name].map((joinSpec) => {
            const joinEntityPath = subEntityPath
                ? subEntityPath + '.' + joinSpec.entityFieldName
                : joinSpec.entityFieldName;
            if (!shouldIncludeField_1.default('', joinEntityPath, projection) || !isInternalCall &&
                typePropertyAnnotationContainer_1.default.isTypePropertyPrivate(EntityClass, joinSpec.entityFieldName)) {
                return '';
            }
            let logicalSubEntityTableName = joinSpec.subEntityTableName;
            let physicalSubEntityTableName = logicalSubEntityTableName;
            if (entityAnnotationContainer_1.default.entityNameToTableNameMap[logicalSubEntityTableName]) {
                physicalSubEntityTableName =
                    entityAnnotationContainer_1.default.entityNameToTableNameMap[logicalSubEntityTableName];
            }
            logicalSubEntityTableName = tableAliasPath + '_' + joinSpec.entityFieldName.toLowerCase();
            const whereClause = tryGetWhereClause_1.default(dbManager, joinEntityPath, filters);
            const sortClause = tryGetOrderByClause_1.default(dbManager, joinEntityPath, sortBys, RootEntityClass, Types);
            const joinTableAlias = dbManager.schema + '_' + logicalSubEntityTableName;
            const outerSortBys = tryGetOrderByClause_1.default(dbManager, joinEntityPath, sortBys, RootEntityClass, Types, joinTableAlias);
            if (outerSortBys) {
                resultOuterSortBys.push(outerSortBys);
            }
            const paginationClause = getPaginationClause_1.default(joinEntityPath, paginations);
            const whereClausePart = joinSpec.subEntityForeignIdFieldName.toLowerCase() +
                ' = ' +
                dbManager.schema +
                '_' +
                tableAliasPath +
                '.' +
                joinSpec.entityIdFieldName.toLowerCase();
            let joinClausePart = 'LEFT JOIN LATERAL (SELECT * FROM ';
            joinClausePart += dbManager.schema + '.' + physicalSubEntityTableName.toLowerCase();
            joinClausePart +=
                (whereClause ? ' ' + whereClause + ' AND ' + whereClausePart : ' WHERE ' + whereClausePart) +
                    (sortClause ? ' ' + sortClause : '') +
                    (paginationClause ? ' ' + paginationClause : '') +
                    ') AS ' +
                    dbManager.schema +
                    '_' +
                    logicalSubEntityTableName.toLowerCase();
            joinClausePart += ' ON ';
            joinClausePart +=
                dbManager.schema +
                    '_' +
                    tableAliasPath +
                    '.' +
                    joinSpec.entityIdFieldName.toLowerCase() +
                    ' = ' +
                    dbManager.schema +
                    '_' +
                    logicalSubEntityTableName.toLowerCase() +
                    '.' +
                    joinSpec.subEntityForeignIdFieldName.toLowerCase();
            return joinClausePart;
        });
        joinClauses = joinClauseParts.filter((joinClausePart) => joinClausePart).join(' ');
    }
    const joinClauseParts = entityAnnotationContainer_1.default.manyToManyRelationTableSpecs
        .filter(({ associationTableName }) => associationTableName.startsWith(EntityClass.name + '_'))
        .map(({ entityFieldName, associationTableName, entityForeignIdFieldName, subEntityName, subEntityForeignIdFieldName }) => {
        const joinEntityPath = subEntityPath ? subEntityPath + '.' + entityFieldName : entityFieldName;
        let logicalSubEntityTableName = subEntityName;
        let physicalSubEntityTableName = logicalSubEntityTableName;
        if (entityAnnotationContainer_1.default.entityNameToTableNameMap[logicalSubEntityTableName]) {
            physicalSubEntityTableName =
                entityAnnotationContainer_1.default.entityNameToTableNameMap[logicalSubEntityTableName];
        }
        logicalSubEntityTableName = tableAliasPath + '_' + entityFieldName.toLowerCase();
        if (!shouldIncludeField_1.default('_id', subEntityPath ? subEntityPath + '.' + entityFieldName : entityFieldName, projection) || !isInternalCall &&
            typePropertyAnnotationContainer_1.default.isTypePropertyPrivate(EntityClass, entityFieldName)) {
            return '';
        }
        const whereClause = tryGetWhereClause_1.default(dbManager, joinEntityPath, filters);
        const joinTableAlias = dbManager.schema + '_' + logicalSubEntityTableName;
        const outerSortBys = tryGetOrderByClause_1.default(dbManager, joinEntityPath, sortBys, RootEntityClass, Types, joinTableAlias);
        if (outerSortBys) {
            resultOuterSortBys.push(outerSortBys);
        }
        if (entityAnnotationContainer_1.default.entityNameToTableNameMap[EntityClass.name]) {
            associationTableName =
                entityAnnotationContainer_1.default.entityNameToTableNameMap[EntityClass.name].toLowerCase() +
                    '_' +
                    associationTableName.split('_')[1];
        }
        const sortClause = tryGetOrderByClause_1.default(dbManager, joinEntityPath, sortBys, RootEntityClass, Types);
        const paginationClause = getPaginationClause_1.default(joinEntityPath, paginations);
        const whereClausePart = '_id = ' +
            dbManager.schema +
            '.' +
            associationTableName.toLowerCase() +
            '.' +
            subEntityForeignIdFieldName.toLowerCase();
        let joinClausePart = 'LEFT JOIN ';
        joinClausePart += dbManager.schema + '.' + associationTableName.toLowerCase();
        joinClausePart += ' ON ';
        joinClausePart +=
            dbManager.schema +
                '_' +
                tableAliasPath +
                '._id' +
                ' = ' +
                dbManager.schema +
                '.' +
                associationTableName.toLowerCase() +
                '.' +
                entityForeignIdFieldName.toLowerCase() +
                ' LEFT JOIN LATERAL (SELECT * FROM ' +
                dbManager.schema +
                '.' +
                physicalSubEntityTableName.toLowerCase() +
                (whereClause ? ' ' + whereClause + ' AND ' + whereClausePart : ' WHERE ' + whereClausePart) +
                (sortClause ? ' ' + sortClause : '') +
                (paginationClause ? ' ' + paginationClause : '') +
                ') AS ' +
                dbManager.schema +
                '_' +
                logicalSubEntityTableName.toLowerCase() +
                ' ON ' +
                dbManager.schema +
                '.' +
                associationTableName.toLowerCase() +
                '.' +
                subEntityForeignIdFieldName.toLowerCase() +
                ' = ' +
                dbManager.schema +
                '_' +
                logicalSubEntityTableName.toLowerCase() +
                '._id';
        return joinClausePart;
    });
    if (joinClauseParts.length > 0) {
        joinClauses = joinClauses + ' ' + joinClauseParts.join(' ');
    }
    const entityMetadata = getClassPropertyNameToPropertyTypeNameMap_1.default(EntityClass);
    Object.entries(entityMetadata).forEach(([fieldName, fieldTypeName]) => {
        const { baseTypeName } = getTypeInfoForTypeName_1.default(fieldTypeName);
        if (isEntityTypeName_1.default(baseTypeName)) {
            const newSubEntityPath = subEntityPath ? subEntityPath + '.' + fieldName : fieldName;
            const subJoinClauses = getJoinClauses(dbManager, newSubEntityPath, projection, filters, sortBys, paginations, Types[baseTypeName], Types, resultOuterSortBys, isInternalCall, tableAliasPath + '_' + fieldName.toLowerCase(), RootEntityClass);
            if (subJoinClauses) {
                joinClauses += ' ' + subJoinClauses;
            }
        }
    });
    return joinClauses;
}
exports.default = getJoinClauses;
//# sourceMappingURL=getJoinClauses.js.map