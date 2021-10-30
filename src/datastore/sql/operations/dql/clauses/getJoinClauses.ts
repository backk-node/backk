import entityAnnotationContainer from "../../../../../decorators/entity/entityAnnotationContainer";
import getClassPropertyNameToPropertyTypeNameMap
  from "../../../../../metadata/getClassPropertyNameToPropertyTypeNameMap";
import { Projection } from "../../../../../types/postqueryoperations/Projection";
import shouldIncludeField from "../utils/columns/shouldIncludeField";
import getTypeInfoForTypeName from "../../../../../utils/type/getTypeInfoForTypeName";
import isEntityTypeName from "../../../../../utils/type/isEntityTypeName";
import tryGetWhereClause from "./tryGetWhereClause";
import tryGetSortClause from "./tryGetOrderByClause";
import getPaginationClause from "./getPaginationClause";
import SqlExpression from "../../../expressions/SqlExpression";
import UserDefinedFilter from "../../../../../types/userdefinedfilters/UserDefinedFilter";
import AbstractSqlDataStore from "../../../../AbstractSqlDataStore";
import SortBy from "../../../../../types/postqueryoperations/SortBy";
import Pagination from "../../../../../types/postqueryoperations/Pagination";
import EntityCountRequest from "../../../../../types/EntityCountRequest";
import isPropertyReadDenied from "../../../../../utils/type/isPropertyReadDenied";

// noinspection OverlyComplexFunctionJS
export default function getJoinClauses(
  dataStore: AbstractSqlDataStore,
  subEntityPath: string,
  projection: Projection,
  filters: SqlExpression[] | UserDefinedFilter[] | undefined,
  sortBys: SortBy[],
  paginations: Pagination[],
  entityCountRequests: EntityCountRequest[] | undefined,
  EntityClass: new () => any,
  Types: object,
  resultOuterSortBys: string[],
  isInternalCall: boolean,
  tableAliasPath = EntityClass.name.toLowerCase(),
  RootEntityClass = EntityClass
) {
  let joinClauses = '';

  if (entityAnnotationContainer.entityNameToJoinsMap[EntityClass.name]) {
    const joinClauseParts = entityAnnotationContainer.entityNameToJoinsMap[EntityClass.name].map(
      (joinSpec) => {
        const joinEntityPath = subEntityPath
          ? subEntityPath + '.' + joinSpec.entityFieldName
          : joinSpec.entityFieldName;

        if (
          !shouldIncludeField('', joinEntityPath, projection, false) ||
          (!isInternalCall &&
            isPropertyReadDenied(EntityClass, joinSpec.entityFieldName))
        ) {
          return '';
        }

        let logicalSubEntityTableName = joinSpec.subEntityTableName;
        let physicalSubEntityTableName = logicalSubEntityTableName;

        if (entityAnnotationContainer.entityNameToTableNameMap[logicalSubEntityTableName]) {
          physicalSubEntityTableName =
            entityAnnotationContainer.entityNameToTableNameMap[logicalSubEntityTableName];
        }

        // noinspection ReuseOfLocalVariableJS
        logicalSubEntityTableName = tableAliasPath + '_' + joinSpec.entityFieldName.toLowerCase();

        const whereClause = tryGetWhereClause(RootEntityClass, dataStore, joinEntityPath, filters);
        const sortClause = tryGetSortClause(dataStore, joinEntityPath, sortBys, RootEntityClass, Types);
        const joinTableAlias = logicalSubEntityTableName;

        const outerSortBys = tryGetSortClause(
          dataStore,
          joinEntityPath,
          sortBys,
          RootEntityClass,
          Types,
          joinTableAlias
        );

        if (outerSortBys) {
          resultOuterSortBys.push(outerSortBys);
        }

        const paginationClause = getPaginationClause(joinEntityPath, paginations);
        const whereClausePart =
          joinSpec.subEntityForeignIdFieldName.toLowerCase() +
          ' = ' +
          '"' + tableAliasPath + '"' +
          '.' +
          joinSpec.entityIdFieldName.toLowerCase();

        const shouldReturnEntityCount = !!entityCountRequests?.find(
          (entityCountRequest) =>
            entityCountRequest.subEntityPath === joinEntityPath || entityCountRequest.subEntityPath === '*'
        );

        let joinClausePart = `LEFT JOIN LATERAL (SELECT *${
          shouldReturnEntityCount ? ', COUNT(*) OVER() AS _count' : ''
        } FROM `;

        joinClausePart += dataStore.getSchema() + '.' + physicalSubEntityTableName.toLowerCase();

        joinClausePart +=
          (whereClause ? ' ' + whereClause + ' AND ' + whereClausePart : ' WHERE ' + whereClausePart) +
          (sortClause ? ' ' + sortClause : '') +
          (paginationClause ? ' ' + paginationClause : '') +
          ') AS "' +
          logicalSubEntityTableName.toLowerCase() + '"';

        joinClausePart += ' ON ';

        joinClausePart +=
          '"' + tableAliasPath + '"' +
          '.' +
          joinSpec.entityIdFieldName.toLowerCase() +
          ' = ' +
          '"' + logicalSubEntityTableName.toLowerCase() + '"' +
          '.' +
          joinSpec.subEntityForeignIdFieldName.toLowerCase();

        return joinClausePart;
      }
    );

    joinClauses = joinClauseParts.filter((joinClausePart) => joinClausePart).join(' ');
  }

  const joinClauseParts = entityAnnotationContainer.manyToManyRelationTableSpecs
    .filter(({ associationTableName }) => associationTableName.startsWith(EntityClass.name + '_'))
    .map(
      ({
        entityFieldName,
        associationTableName,
        entityForeignIdFieldName,
        subEntityName,
        subEntityForeignIdFieldName
      }) => {
        const joinEntityPath = subEntityPath ? subEntityPath + '.' + entityFieldName : entityFieldName;
        let logicalSubEntityTableName = subEntityName;
        let physicalSubEntityTableName = logicalSubEntityTableName;

        if (entityAnnotationContainer.entityNameToTableNameMap[logicalSubEntityTableName]) {
          physicalSubEntityTableName =
            entityAnnotationContainer.entityNameToTableNameMap[logicalSubEntityTableName];
        }

        // noinspection ReuseOfLocalVariableJS
        logicalSubEntityTableName = tableAliasPath + '_' + entityFieldName.toLowerCase();

        if (
          !shouldIncludeField(
            '_id',
            subEntityPath ? subEntityPath + '.' + entityFieldName : entityFieldName,
            projection,
            false
          ) ||
          (!isInternalCall &&
            isPropertyReadDenied(EntityClass, entityFieldName))
        ) {
          return '';
        }

        const whereClause = tryGetWhereClause(RootEntityClass, dataStore, joinEntityPath, filters);
        const joinTableAlias = logicalSubEntityTableName;
        const outerSortBys = tryGetSortClause(
          dataStore,
          joinEntityPath,
          sortBys,
          RootEntityClass,
          Types,
          joinTableAlias
        );

        if (outerSortBys) {
          resultOuterSortBys.push(outerSortBys);
        }

        if (entityAnnotationContainer.entityNameToTableNameMap[EntityClass.name]) {
          // noinspection AssignmentToFunctionParameterJS
          associationTableName =
            entityAnnotationContainer.entityNameToTableNameMap[EntityClass.name].toLowerCase() +
            '_' +
            associationTableName.split('_')[1];
        }

        const sortClause = tryGetSortClause(dataStore, joinEntityPath, sortBys, RootEntityClass, Types);
        const paginationClause = getPaginationClause(joinEntityPath, paginations);
        const whereClausePart =
          '_id = ' +
          dataStore.getSchema() +
          '.' +
          associationTableName.toLowerCase() +
          '.' +
          subEntityForeignIdFieldName.toLowerCase();

        const shouldReturnEntityCount = !!entityCountRequests?.find(
          (entityCountRequest) =>
            entityCountRequest.subEntityPath === joinEntityPath || entityCountRequest.subEntityPath === '*'
        );

        let joinClausePart = 'LEFT JOIN ';
        joinClausePart += dataStore.getSchema() + '.' + associationTableName.toLowerCase();
        joinClausePart += ' ON ';
        joinClausePart +=
          '"' + tableAliasPath + '"' +
          '._id' +
          ' = ' +
          dataStore.getSchema() +
          '.' +
          associationTableName.toLowerCase() +
          '.' +
          entityForeignIdFieldName.toLowerCase() +
          ` LEFT JOIN LATERAL (SELECT *${
            shouldReturnEntityCount ? ', COUNT(*) OVER() AS _count' : ''
          } FROM ` +
          dataStore.getSchema() +
          '.' +
          physicalSubEntityTableName.toLowerCase() +
          (whereClause ? ' ' + whereClause + ' AND ' + whereClausePart : ' WHERE ' + whereClausePart) +
          (sortClause ? ' ' + sortClause : '') +
          (paginationClause ? ' ' + paginationClause : '') +
          ') AS "' +
          logicalSubEntityTableName.toLowerCase() + '"' +
          ' ON ' +
          dataStore.getSchema() +
          '.' +
          associationTableName.toLowerCase() +
          '.' +
          subEntityForeignIdFieldName.toLowerCase() +
          ' = ' +
          '"' + logicalSubEntityTableName.toLowerCase() + '"' +
          '._id';

        return joinClausePart;
      }
    );

  if (joinClauseParts.length > 0) {
    joinClauses = joinClauses + ' ' + joinClauseParts.join(' ');
  }

  const entityMetadata = getClassPropertyNameToPropertyTypeNameMap(EntityClass as any);

  Object.entries(entityMetadata).forEach(([fieldName, fieldTypeName]: [any, any]) => {
    const { baseTypeName } = getTypeInfoForTypeName(fieldTypeName);

    if (isEntityTypeName(baseTypeName)) {
      const newSubEntityPath = subEntityPath ? subEntityPath + '.' + fieldName : fieldName;

      const subJoinClauses = getJoinClauses(
        dataStore,
        newSubEntityPath,
        projection,
        filters,
        sortBys,
        paginations,
        entityCountRequests,
        (Types as any)[baseTypeName],
        Types,
        resultOuterSortBys,
        isInternalCall,
        tableAliasPath + '_' + fieldName.toLowerCase(),
        RootEntityClass
      );

      if (subJoinClauses) {
        joinClauses += ' ' + subJoinClauses;
      }
    }
  });

  return joinClauses;
}
