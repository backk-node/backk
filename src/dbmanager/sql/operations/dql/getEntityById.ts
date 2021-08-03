import AbstractSqlDbManager from '../../../AbstractSqlDbManager';
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
import { One } from '../../../AbstractDbManager';
import { BackkEntity } from '../../../../types/entities/BackkEntity';
import createCurrentPageTokens from '../../../utils/createCurrentPageTokens';
import tryEnsureProperPageIsRequested from "../../../utils/tryEnsureProperPageIsRequested";

// noinspection OverlyComplexFunctionJS,FunctionTooLongJS
export default async function getEntityById<T extends BackkEntity>(
  dbManager: AbstractSqlDbManager,
  _id: string,
  EntityClass: new () => T,
  postQueryOperations: PostQueryOperations,
  allowFetchingOnlyPreviousOrNextPage: boolean,
  options?: {
    preHooks?: PreHook | PreHook[];
    postHook?: PostHook<T>;
    ifEntityNotFoundReturn?: () => PromiseErrorOr<One<T>>;
  },
  isSelectForUpdate = false,
  isInternalCall = false
): PromiseErrorOr<One<T>> {
  if (allowFetchingOnlyPreviousOrNextPage) {
    tryEnsureProperPageIsRequested(postQueryOperations.currentPageTokens, postQueryOperations.paginations);
  }

  // noinspection AssignmentToFunctionParameterJS
  EntityClass = dbManager.getType(EntityClass);
  let didStartTransaction = false;

  try {
    if (
      postQueryOperations?.includeResponseFields?.length === 1 &&
      postQueryOperations.includeResponseFields[0] === '_id'
    ) {
      return [
        { metadata: { currentPageTokens: undefined, entityCounts: undefined }, data: { _id } as T },
        null
      ];
    }

    if (options?.postHook || options?.preHooks || options?.ifEntityNotFoundReturn) {
      didStartTransaction = await tryStartLocalTransactionIfNeeded(dbManager);
    }

    await tryExecutePreHooks(options?.preHooks ?? []);
    updateDbLocalTransactionCount(dbManager);

    if (
      getNamespace('multipleServiceFunctionExecutions')?.get('globalTransaction') ||
      dbManager.getClsNamespace()?.get('globalTransaction') ||
      dbManager.getClsNamespace()?.get('localTransaction')
    ) {
      // noinspection AssignmentToFunctionParameterJS
      isSelectForUpdate = true;
    }

    const { columns, joinClauses, outerSortClause } = getSqlSelectStatementParts(
      dbManager,
      postQueryOperations,
      EntityClass,
      undefined,
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
    const tableAlias = dbManager.schema + '_' + EntityClass.name.toLowerCase();

    const selectStatement = [
      `SELECT ${columns} FROM (SELECT * FROM ${dbManager.schema}.${tableName}`,
      `WHERE ${idFieldName} = ${dbManager.getValuePlaceholder(1)} LIMIT 1) AS ${tableAlias}`,
      joinClauses,
      outerSortClause,
      isSelectForUpdate ? dbManager.getUpdateForClause(tableAlias) : undefined
    ]
      .filter((sqlPart) => sqlPart)
      .join(' ');

    const result = await dbManager.tryExecuteQuery(selectStatement, [numericId]);

    let entity;
    let error = null;

    if (dbManager.getResultRows(result).length === 0 && options?.ifEntityNotFoundReturn) {
      [entity, error] = await options?.ifEntityNotFoundReturn();
    } else {
      if (dbManager.getResultRows(result).length === 0) {
        await tryCommitLocalTransactionIfNeeded(didStartTransaction, dbManager);
        return [
          null,
          createBackkErrorFromErrorCodeMessageAndStatus({
            ...BACKK_ERRORS.ENTITY_NOT_FOUND,
            message: `${EntityClass.name} with _id ${_id} not found`
          })
        ];
      }

      entity = transformRowsToObjects(
        dbManager.getResultRows(result),
        EntityClass,
        postQueryOperations,
        dbManager,
        isInternalCall
      )[0];

      entity = {
        metadata: {
          currentPageTokens: allowFetchingOnlyPreviousOrNextPage
            ? createCurrentPageTokens(postQueryOperations.paginations)
            : undefined,
          entityCounts: undefined
        },
        data: entity
      };
    }

    if (options?.postHook) {
      await tryExecutePostHook(options?.postHook, entity);
    }

    await tryCommitLocalTransactionIfNeeded(didStartTransaction, dbManager);
    return [entity, error];
  } catch (error) {
    await tryRollbackLocalTransactionIfNeeded(didStartTransaction, dbManager);
    return [null, createBackkErrorFromError(error)];
  } finally {
    cleanupLocalTransactionIfNeeded(didStartTransaction, dbManager);
  }
}
