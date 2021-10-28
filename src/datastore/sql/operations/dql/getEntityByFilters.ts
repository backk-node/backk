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
import tryCommitLocalTransactionIfNeeded from '../transaction/tryCommitLocalTransactionIfNeeded';
import tryRollbackLocalTransactionIfNeeded from '../transaction/tryRollbackLocalTransactionIfNeeded';
import cleanupLocalTransactionIfNeeded from '../transaction/cleanupLocalTransactionIfNeeded';
import createBackkErrorFromErrorCodeMessageAndStatus from '../../../../errors/createBackkErrorFromErrorCodeMessageAndStatus';
import { BACKK_ERRORS } from '../../../../errors/backkErrors';
import tryExecutePostHook from '../../../hooks/tryExecutePostHook';
import { PostHook } from '../../../hooks/PostHook';
import { One } from '../../../DataStore';
import createCurrentPageTokens from '../../../utils/createCurrentPageTokens';
import tryEnsurePreviousOrNextPageIsRequested from '../../../utils/tryEnsurePreviousOrNextPageIsRequested';
import EntityCountRequest from '../../../../types/EntityCountRequest';
import getUserAccountIdFieldNameAndRequiredValue from '../../../utils/getUserAccountIdFieldNameAndRequiredValue';
import SqlEquals from '../../expressions/SqlEquals';

export default async function getEntityByFilters<T>(
  dataStore: AbstractSqlDataStore,
  filters: Array<MongoDbQuery<T> | SqlExpression | UserDefinedFilter> | object,
  EntityClass: new () => T,
  postQueryOperations: PostQueryOperations,
  allowFetchingOnlyPreviousOrNextPage: boolean,
  options?: {
    preHooks?: PreHook | PreHook[];
    ifEntityNotFoundReturn?: () => PromiseErrorOr<One<T>>;
    postHook?: PostHook<T>;
    entityCountRequests?: EntityCountRequest[];
  },
  isSelectForUpdate = false,
  isInternalCall = false
): PromiseErrorOr<One<T>> {
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
    if (options?.preHooks || options?.postHook || options?.ifEntityNotFoundReturn) {
      didStartTransaction = await tryStartLocalTransactionIfNeeded(dataStore);
    }

    const [userAccountIdFieldName, userAccountId] = getUserAccountIdFieldNameAndRequiredValue(dataStore);
    if (userAccountIdFieldName && userAccountId !== undefined) {
      (filters as any).push(new SqlEquals({ [userAccountIdFieldName]: userAccountId }));
    }

    updateDbLocalTransactionCount(dataStore);
    await tryExecutePreHooks(options?.preHooks ?? []);

    if (
      getNamespace('multipleServiceFunctionExecutions')?.get('globalTransaction') ||
      dataStore.getClsNamespace()?.get('globalTransaction') ||
      dataStore.getClsNamespace()?.get('localTransaction')
    ) {
      // noinspection AssignmentToFunctionParameterJS
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
      options?.entityCountRequests,
      isInternalCall
    );

    const tableName = getTableName(EntityClass.name);
    const tableAlias = EntityClass.name.toLowerCase();

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
      `) AS "${tableAlias}"`,
      joinClauses,
      outerSortClause,
      isSelectForUpdate ? dataStore.getUpdateForClause(tableAlias) : undefined
    ]
      .filter((sqlPart) => sqlPart)
      .join(' ');

    const result = await dataStore.tryExecuteQueryWithNamedParameters(selectStatement, filterValues);

    const entities = transformRowsToObjects(
      dataStore.getResultRows(result),
      EntityClass,
      postQueryOperations,
      dataStore,
      options?.entityCountRequests,
      isInternalCall
    );

    let entity: One<T> | null | undefined = {
      metadata: {
        currentPageTokens: allowFetchingOnlyPreviousOrNextPage
          ? createCurrentPageTokens(postQueryOperations.paginations)
          : undefined
      },
      data: entities[0]
    };
    let error;

    if (entities?.length === 0) {
      if (options?.ifEntityNotFoundReturn) {
        [entity, error] = await options.ifEntityNotFoundReturn();
        entities.push(entity);
      } else {
        return [
          null,
          createBackkErrorFromErrorCodeMessageAndStatus({
            ...BACKK_ERRORS.ENTITY_NOT_FOUND,
            message: `${EntityClass.name} with given filter(s) not found`
          })
        ];
      }
    }

    if (options?.postHook) {
      await tryExecutePostHook(options.postHook, entity);
    }

    await tryCommitLocalTransactionIfNeeded(didStartTransaction, dataStore);
    return [entity, error];
  } catch (error) {
    await tryRollbackLocalTransactionIfNeeded(didStartTransaction, dataStore);
    return [null, createBackkErrorFromError(error)];
  } finally {
    cleanupLocalTransactionIfNeeded(didStartTransaction, dataStore);
  }
}
