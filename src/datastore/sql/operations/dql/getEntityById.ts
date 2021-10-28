import AbstractSqlDataStore from '../../../AbstractSqlDataStore';
import transformRowsToObjects from './transformresults/transformRowsToObjects';
import createBackkErrorFromError from '../../../../errors/createBackkErrorFromError';
import getClassPropertyNameToPropertyTypeNameMap from '../../../../metadata/getClassPropertyNameToPropertyTypeNameMap';
import { PostQueryOperations } from '../../../../types/postqueryoperations/PostQueryOperations';
import getSqlSelectStatementParts from './utils/getSqlSelectStatementParts';
import updateDbLocalTransactionCount from './utils/updateDbLocalTransactionCount';
import getTableName from '../../../utils/getTableName';
import createBackkErrorFromErrorCodeMessageAndStatus from '../../../../errors/createBackkErrorFromErrorCodeMessageAndStatus';
import createErrorFromErrorCodeMessageAndStatus from '../../../../errors/createErrorFromErrorCodeMessageAndStatus';
import { BACKK_ERRORS } from '../../../../errors/backkErrors';
import { PromiseErrorOr } from '../../../../types/PromiseErrorOr';
import { PostHook } from '../../../hooks/PostHook';
import tryStartLocalTransactionIfNeeded from '../transaction/tryStartLocalTransactionIfNeeded';
import tryCommitLocalTransactionIfNeeded from '../transaction/tryCommitLocalTransactionIfNeeded';
import tryRollbackLocalTransactionIfNeeded from '../transaction/tryRollbackLocalTransactionIfNeeded';
import cleanupLocalTransactionIfNeeded from '../transaction/cleanupLocalTransactionIfNeeded';
import { getNamespace } from 'cls-hooked';
import tryExecutePostHook from '../../../hooks/tryExecutePostHook';
import { PreHook } from '../../../hooks/PreHook';
import tryExecutePreHooks from '../../../hooks/tryExecutePreHooks';
import { One } from '../../../DataStore';
import { BackkEntity } from '../../../../types/entities/BackkEntity';
import createCurrentPageTokens from '../../../utils/createCurrentPageTokens';
import tryEnsurePreviousOrNextPageIsRequested from '../../../utils/tryEnsurePreviousOrNextPageIsRequested';
import EntityCountRequest from '../../../../types/EntityCountRequest';
import getUserAccountIdFieldNameAndRequiredValue from '../../../utils/getUserAccountIdFieldNameAndRequiredValue';

// noinspection OverlyComplexFunctionJS,FunctionTooLongJS
export default async function getEntityById<T extends BackkEntity>(
  dataStore: AbstractSqlDataStore,
  _id: string,
  EntityClass: new () => T,
  postQueryOperations: PostQueryOperations,
  allowFetchingOnlyPreviousOrNextPage: boolean,
  options?: {
    preHooks?: PreHook | PreHook[];
    postHook?: PostHook<T>;
    ifEntityNotFoundReturn?: () => PromiseErrorOr<One<T>>;
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

  // noinspection AssignmentToFunctionParameterJS
  EntityClass = dataStore.getType(EntityClass);
  let didStartTransaction = false;

  try {
    if (
      postQueryOperations?.includeResponseFields?.length === 1 &&
      postQueryOperations.includeResponseFields[0] === '_id'
    ) {
      return [{ metadata: { currentPageTokens: undefined }, data: { _id } as T }, null];
    }

    if (options?.postHook || options?.preHooks || options?.ifEntityNotFoundReturn) {
      didStartTransaction = await tryStartLocalTransactionIfNeeded(dataStore);
    }

    await tryExecutePreHooks(options?.preHooks ?? []);
    updateDbLocalTransactionCount(dataStore);

    if (
      getNamespace('multipleServiceFunctionExecutions')?.get('globalTransaction') ||
      dataStore.getClsNamespace()?.get('globalTransaction') ||
      dataStore.getClsNamespace()?.get('localTransaction')
    ) {
      // noinspection AssignmentToFunctionParameterJS
      isSelectForUpdate = true;
    }

    const { columns, joinClauses, outerSortClause } = getSqlSelectStatementParts(
      dataStore,
      postQueryOperations,
      EntityClass,
      undefined,
      options?.entityCountRequests,
      isInternalCall
    );

    const typeMetadata = getClassPropertyNameToPropertyTypeNameMap(EntityClass);
    const idFieldName = typeMetadata._id ? '_id' : 'id';
    const numericId = parseInt(_id, 10);

    if (isNaN(numericId)) {
      // noinspection ExceptionCaughtLocallyJS
      throw createErrorFromErrorCodeMessageAndStatus({
        ...BACKK_ERRORS.INVALID_ARGUMENT,
        message: BACKK_ERRORS.INVALID_ARGUMENT.message + idFieldName + ' must be a numeric id'
      });
    }

    const tableName = getTableName(EntityClass.name);
    const tableAlias = EntityClass.name.toLowerCase();

    const shouldReturnRootEntityCount = !!options?.entityCountRequests?.find(
      (entityCountRequest) =>
        entityCountRequest.subEntityPath === '' || entityCountRequest.subEntityPath === '*'
    );

    const [userAccountIdFieldName, userAccountId] = getUserAccountIdFieldNameAndRequiredValue(dataStore);
    const additionalWhereExpression =
      userAccountIdFieldName && userAccountId !== undefined
        ? ` AND ${userAccountIdFieldName} = ${dataStore.getValuePlaceholder(
            2
          )}`
        : '';

    const selectStatement = [
      `SELECT ${columns} FROM (SELECT *${
        shouldReturnRootEntityCount ? ', COUNT(*) OVER() AS _count' : ''
      } FROM ${dataStore.schema}.${tableName}`,
      `WHERE ${idFieldName} = ${dataStore.getValuePlaceholder(
        1
      )}${additionalWhereExpression} LIMIT 1) AS "${tableAlias}"`,
      joinClauses,
      outerSortClause,
      isSelectForUpdate ? dataStore.getUpdateForClause(tableAlias) : undefined
    ]
      .filter((sqlPart) => sqlPart)
      .join(' ');

    const result = await dataStore.tryExecuteQuery(selectStatement, [
      numericId,
      ...(additionalWhereExpression ? [userAccountId] : [])
    ]);

    let entity;
    let error = null;

    if (dataStore.getResultRows(result).length === 0 && options?.ifEntityNotFoundReturn) {
      [entity, error] = await options?.ifEntityNotFoundReturn();
    } else {
      if (dataStore.getResultRows(result).length === 0) {
        await tryCommitLocalTransactionIfNeeded(didStartTransaction, dataStore);
        return [
          null,
          createBackkErrorFromErrorCodeMessageAndStatus({
            ...BACKK_ERRORS.ENTITY_NOT_FOUND,
            message: `${EntityClass.name} with _id ${_id} not found`
          })
        ];
      }

      entity = transformRowsToObjects(
        dataStore.getResultRows(result),
        EntityClass,
        postQueryOperations,
        dataStore,
        options?.entityCountRequests,
        isInternalCall
      )[0];

      entity = {
        metadata: {
          currentPageTokens: allowFetchingOnlyPreviousOrNextPage
            ? createCurrentPageTokens(postQueryOperations.paginations)
            : undefined
        },
        data: entity
      };
    }

    if (options?.postHook) {
      await tryExecutePostHook(options?.postHook, entity);
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
