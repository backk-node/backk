import SqlExpression from '../../expressions/SqlExpression';
import AbstractSqlDataStore from '../../../AbstractSqlDataStore';
import transformRowsToObjects from './transformresults/transformRowsToObjects';
import createBackkErrorFromError from '../../../../errors/createBackkErrorFromError';
import { PostQueryOperations } from '../../../../types/postqueryoperations/PostQueryOperations';
import getSqlSelectStatementParts from './utils/getSqlSelectStatementParts';
import updateDbLocalTransactionCount from './utils/updateDbLocalTransactionCount';
import UserDefinedFilter from '../../../../types/userdefinedfilters/UserDefinedFilter';
import MongoDbQuery from '../../../mongodb/MongoDbQuery';
import convertFilterObjectToSqlEquals from './utils/convertFilterObjectToSqlEquals';
import getTableName from '../../../utils/getTableName';
import { PromiseErrorOr } from '../../../../types/PromiseErrorOr';
import { getNamespace } from 'cls-hooked';
import { PreHook } from '../../../hooks/PreHook';
import tryStartLocalTransactionIfNeeded from '../transaction/tryStartLocalTransactionIfNeeded';
import tryExecutePreHooks from '../../../hooks/tryExecutePreHooks';
import { EntitiesPostHook } from '../../../hooks/EntitiesPostHook';
import tryCommitLocalTransactionIfNeeded from '../transaction/tryCommitLocalTransactionIfNeeded';
import tryRollbackLocalTransactionIfNeeded from '../transaction/tryRollbackLocalTransactionIfNeeded';
import cleanupLocalTransactionIfNeeded from '../transaction/cleanupLocalTransactionIfNeeded';
import tryExecuteEntitiesPostHook from '../../../hooks/tryExecuteEntitiesPostHook';
import { Many } from '../../../AbstractDataStore';
import { BackkEntity } from '../../../../types/entities/BackkEntity';
import createCurrentPageTokens from '../../../utils/createCurrentPageTokens';
import tryEnsurePreviousOrNextPageIsRequested from '../../../utils/tryEnsurePreviousOrNextPageIsRequested';
import EntityCountRequest from '../../../../types/EntityCountRequest';
import getUserAccountIdFieldNameAndRequiredValue from '../../../utils/getUserAccountIdFieldNameAndRequiredValue';
import SqlEquals from '../../expressions/SqlEquals';

export default async function getEntitiesByFilters<T extends BackkEntity>(
  dataStore: AbstractSqlDataStore,
  filters: Array<MongoDbQuery<T> | SqlExpression | UserDefinedFilter> | object,
  EntityClass: new () => T,
  postQueryOperations: PostQueryOperations,
  allowFetchingOnlyPreviousOrNextPage: boolean,
  options?: {
    preHooks?: PreHook | PreHook[];
    postHook?: EntitiesPostHook<T>;
    entityCountRequests?: EntityCountRequest[];
  }
): PromiseErrorOr<Many<T>> {
  if (allowFetchingOnlyPreviousOrNextPage) {
    tryEnsurePreviousOrNextPageIsRequested(
      postQueryOperations.currentPageTokens,
      postQueryOperations.paginations
    );
  }

  if (typeof filters === 'object' && !Array.isArray(filters)) {
    // noinspection AssignmentToFunctionParameterJS
    filters = convertFilterObjectToSqlEquals(filters);
  } else if (filters.find((filter) => filter instanceof MongoDbQuery)) {
    throw new Error('filters must be an array of SqlExpressions and/or UserDefinedFilters');
  }

  // noinspection AssignmentToFunctionParameterJS
  EntityClass = dataStore.getType(EntityClass);
  let didStartTransaction = false;

  try {
    if (options?.preHooks || options?.postHook) {
      didStartTransaction = await tryStartLocalTransactionIfNeeded(dataStore);
    }

    const [userAccountIdFieldName, userAccountId] = getUserAccountIdFieldNameAndRequiredValue(dataStore);
    if (userAccountIdFieldName && userAccountId !== undefined) {
      (filters as any).push(new SqlEquals({ [userAccountIdFieldName]: userAccountId }));
    }

    updateDbLocalTransactionCount(dataStore);
    await tryExecutePreHooks(options?.preHooks ?? []);
    let isSelectForUpdate = false;

    if (
      getNamespace('multipleServiceFunctionExecutions')?.get('globalTransaction') ||
      dataStore.getClsNamespace()?.get('globalTransaction') ||
      dataStore.getClsNamespace()?.get('localTransaction')
    ) {
      isSelectForUpdate = true;
    }

    const {
      rootWhereClause,
      rootSortClause,
      rootPaginationClause,
      columns,
      joinClauses,
      filterValues,
      outerSortClause
    } = getSqlSelectStatementParts(
      dataStore,
      postQueryOperations,
      EntityClass,
      filters as any,
      options?.entityCountRequests
    );

    const tableName = getTableName(EntityClass.name);
    const tableAlias = dataStore.schema + '_' + EntityClass.name.toLowerCase();

    const shouldReturnRootEntityCount = !!options?.entityCountRequests?.find(
      (entityCountRequest) =>
        entityCountRequest.subEntityPath === '' || entityCountRequest.subEntityPath === '*'
    );

    const selectStatement = [
      `SELECT ${columns} FROM (SELECT *${
        shouldReturnRootEntityCount ? ', COUNT(*) OVER() AS _count' : ''
      } FROM ${dataStore.schema}.${tableName}`,
      rootWhereClause,
      rootSortClause,
      rootPaginationClause,
      `) AS ${tableAlias}`,
      joinClauses,
      outerSortClause,
      isSelectForUpdate ? dataStore.getUpdateForClause(tableAlias) : undefined
    ]
      .filter((sqlPart) => sqlPart)
      .join(' ');

    const result = await dataStore.tryExecuteQueryWithNamedParameters(selectStatement, filterValues);

    const objects = transformRowsToObjects(
      dataStore.getResultRows(result),
      EntityClass,
      postQueryOperations,
      dataStore,
      options?.entityCountRequests
    );

    const entities = {
      metadata: {
        currentPageTokens: allowFetchingOnlyPreviousOrNextPage
          ? createCurrentPageTokens(postQueryOperations.paginations)
          : undefined
      },
      data: objects
    };

    if (options?.postHook) {
      await tryExecuteEntitiesPostHook(options.postHook, entities);
    }

    await tryCommitLocalTransactionIfNeeded(didStartTransaction, dataStore);
    return [entities, null];
  } catch (error) {
    await tryRollbackLocalTransactionIfNeeded(didStartTransaction, dataStore);
    return [null, createBackkErrorFromError(error)];
  } finally {
    cleanupLocalTransactionIfNeeded(didStartTransaction, dataStore);
  }
}
