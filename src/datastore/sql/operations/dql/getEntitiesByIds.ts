import AbstractSqlDataStore from '../../../AbstractSqlDataStore';
import transformRowsToObjects from './transformresults/transformRowsToObjects';
import createBackkErrorFromError from '../../../../errors/createBackkErrorFromError';
import { PostQueryOperations } from '../../../../types/postqueryoperations/PostQueryOperations';
import getSqlSelectStatementParts from './utils/getSqlSelectStatementParts';
import updateDbLocalTransactionCount from './utils/updateDbLocalTransactionCount';
import getTableName from '../../../utils/getTableName';
import createBackkErrorFromErrorCodeMessageAndStatus from '../../../../errors/createBackkErrorFromErrorCodeMessageAndStatus';
import { BACKK_ERRORS } from '../../../../errors/backkErrors';
import { PromiseErrorOr } from '../../../../types/PromiseErrorOr';
import { getNamespace } from 'cls-hooked';
import getClassPropertyNameToPropertyTypeNameMap from '../../../../metadata/getClassPropertyNameToPropertyTypeNameMap';
import DefaultPostQueryOperations from '../../../../types/postqueryoperations/DefaultPostQueryOperations';
import { Many } from '../../../AbstractDataStore';
import createCurrentPageTokens from '../../../utils/createCurrentPageTokens';
import tryEnsurePreviousOrNextPageIsRequested from '../../../utils/tryEnsurePreviousOrNextPageIsRequested';
import EntityCountRequest from '../../../../types/EntityCountRequest';
import getUserAccountIdFieldNameAndRequiredValue from '../../../utils/getUserAccountIdFieldNameAndRequiredValue';

export default async function getEntitiesByIds<T>(
  dataStore: AbstractSqlDataStore,
  _ids: string[],
  EntityClass: new () => T,
  postQueryOperations: PostQueryOperations,
  allowFetchingOnlyPreviousOrNextPage: boolean,
  entityCountRequests?: EntityCountRequest[]
): PromiseErrorOr<Many<T>> {
  try {
    if (allowFetchingOnlyPreviousOrNextPage) {
      tryEnsurePreviousOrNextPageIsRequested(
        postQueryOperations.currentPageTokens,
        postQueryOperations.paginations
      );
    }

    updateDbLocalTransactionCount(dataStore);

    let isSelectForUpdate = false;

    if (
      getNamespace('multipleServiceFunctionExecutions')?.get('globalTransaction') ||
      dataStore.getClsNamespace()?.get('globalTransaction') ||
      dataStore.getClsNamespace()?.get('localTransaction')
    ) {
      isSelectForUpdate = true;
    }

    const {
      rootSortClause,
      rootPaginationClause,
      columns,
      joinClauses,
      outerSortClause
    } = getSqlSelectStatementParts(
      dataStore,
      postQueryOperations ?? new DefaultPostQueryOperations(),
      EntityClass,
      undefined,
      entityCountRequests
    );

    const numericIds = _ids.map((id) => {
      const numericId = parseInt(id, 10);

      if (isNaN(numericId)) {
        throw createBackkErrorFromErrorCodeMessageAndStatus({
          ...BACKK_ERRORS.INVALID_ARGUMENT,
          message: BACKK_ERRORS.INVALID_ARGUMENT.message + ' all _ids must be numeric values'
        });
      }

      return numericId;
    });

    const entityMetadata = getClassPropertyNameToPropertyTypeNameMap(EntityClass);
    const idFieldName = entityMetadata._id ? '_id' : 'id';
    const idPlaceholders = _ids.map((_, index) => dataStore.getValuePlaceholder(index + 1)).join(', ');
    const tableName = getTableName(EntityClass.name);
    const tableAlias = EntityClass.name.toLowerCase();

    const shouldReturnRootEntityCount = !!entityCountRequests?.find(
      (entityCountRequest) =>
        entityCountRequest.subEntityPath === '' || entityCountRequest.subEntityPath === '*'
    );

    const [userAccountIdFieldName, userAccountId] = getUserAccountIdFieldNameAndRequiredValue(dataStore);
    const additionalWhereExpression =
      userAccountIdFieldName && userAccountId !== undefined
        ? ` AND ${userAccountIdFieldName} = ${dataStore.getValuePlaceholder(
            numericIds.length + 1
          )}`
        : '';

    const selectStatement = [
      `SELECT ${columns} FROM (SELECT *${
        shouldReturnRootEntityCount ? ', COUNT(*) OVER() AS _count' : ''
      } FROM ${dataStore.schema}.${tableName}`,
      `WHERE ${idFieldName} IN (${idPlaceholders}${additionalWhereExpression}`,
      rootSortClause,
      rootPaginationClause,
      `) AS "${tableAlias}"`,
      joinClauses,
      outerSortClause,
      isSelectForUpdate ? dataStore.getUpdateForClause(tableAlias) : undefined
    ]
      .filter((sqlPart) => sqlPart)
      .join(' ');

    const result = await dataStore.tryExecuteQuery(selectStatement, [
      ...numericIds,
      ...(additionalWhereExpression ? [userAccountId] : [])
    ]);

    if (dataStore.getResultRows(result).length === 0) {
      return [
        null,
        createBackkErrorFromErrorCodeMessageAndStatus({
          ...BACKK_ERRORS.ENTITY_NOT_FOUND,
          message: `${EntityClass.name}s with _ids: ${_ids.join(', ')} not found`
        })
      ];
    }

    const entities = transformRowsToObjects(
      dataStore.getResultRows(result),
      EntityClass,
      postQueryOperations ?? new DefaultPostQueryOperations(),
      dataStore,
      entityCountRequests
    );

    return [
      {
        metadata: {
          currentPageTokens: allowFetchingOnlyPreviousOrNextPage
            ? createCurrentPageTokens(postQueryOperations.paginations)
            : undefined
        },
        data: entities
      },
      null
    ];
  } catch (error) {
    return [null, createBackkErrorFromError(error)];
  }
}
