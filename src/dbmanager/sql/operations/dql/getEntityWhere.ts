import AbstractSqlDbManager from '../../../AbstractSqlDbManager';
import { PostQueryOperations } from '../../../../types/postqueryoperations/PostQueryOperations';
import DefaultPostQueryOperations from '../../../../types/postqueryoperations/DefaultPostQueryOperations';
import getSqlSelectStatementParts from './utils/getSqlSelectStatementParts';
import updateDbLocalTransactionCount from './utils/updateDbLocalTransactionCount';
import isUniqueField from './utils/isUniqueField';
import SqlEquals from '../../expressions/SqlEquals';
import transformRowsToObjects from './transformresults/transformRowsToObjects';
import createBackkErrorFromError from '../../../../errors/createBackkErrorFromError';
import getTableName from '../../../utils/getTableName';
import createBackkErrorFromErrorCodeMessageAndStatus from '../../../../errors/createBackkErrorFromErrorCodeMessageAndStatus';
import { BACKK_ERRORS } from '../../../../errors/backkErrors';
import { PromiseErrorOr } from '../../../../types/PromiseErrorOr';
import { PostHook } from '../../../hooks/PostHook';
import tryStartLocalTransactionIfNeeded from '../transaction/tryStartLocalTransactionIfNeeded';
import tryCommitLocalTransactionIfNeeded from '../transaction/tryCommitLocalTransactionIfNeeded';
import tryRollbackLocalTransactionIfNeeded from '../transaction/tryRollbackLocalTransactionIfNeeded';
import cleanupLocalTransactionIfNeeded from '../transaction/cleanupLocalTransactionIfNeeded';
import { getNamespace } from "cls-hooked";
import tryExecutePostHook from "../../../hooks/tryExecutePostHook";
import { PreHook } from "../../../hooks/PreHook";
import tryExecutePreHooks from "../../../hooks/tryExecutePreHooks";

// noinspection OverlyComplexFunctionJS,FunctionTooLongJS
export default async function getEntityWhere<T>(
  dbManager: AbstractSqlDbManager,
  fieldPathName: string,
  fieldValue: any,
  EntityClass: new () => T,
  preHooks?: PreHook | PreHook[],
  postQueryOperations?: PostQueryOperations,
  postHook?: PostHook<T>,
  ifEntityNotFoundReturn?: () => PromiseErrorOr<T>,
  isSelectForUpdate = false,
  isInternalCall = false
): PromiseErrorOr<T> {
  if (!isUniqueField(fieldPathName, EntityClass, dbManager.getTypes())) {
    throw new Error(`Field ${fieldPathName} is not unique. Annotate entity field with @Unique annotation`);
  }

  // noinspection AssignmentToFunctionParameterJS
  EntityClass = dbManager.getType(EntityClass);
  const finalPostQueryOperations = postQueryOperations ?? new DefaultPostQueryOperations();
  let didStartTransaction = false;

  try {
    if (postHook || preHooks || ifEntityNotFoundReturn) {
      didStartTransaction = await tryStartLocalTransactionIfNeeded(dbManager);
    }

    await tryExecutePreHooks(preHooks ?? []);

    if (
      getNamespace('multipleServiceFunctionExecutions')?.get('globalTransaction') ||
      dbManager.getClsNamespace()?.get('globalTransaction') ||
      dbManager.getClsNamespace()?.get('localTransaction')
    ) {
      // noinspection AssignmentToFunctionParameterJS
      isSelectForUpdate = true;
    }

    updateDbLocalTransactionCount(dbManager);
    const lastDotPosition = fieldPathName.lastIndexOf('.');
    const fieldName = lastDotPosition === -1 ? fieldPathName : fieldPathName.slice(lastDotPosition + 1);

    const filters = [
      new SqlEquals(
        { [fieldName]: fieldValue },
        lastDotPosition === -1 ? '' : fieldPathName.slice(0, lastDotPosition)
      )
    ];

    const {
      rootWhereClause,
      columns,
      joinClauses,
      filterValues,
      outerSortClause
    } = getSqlSelectStatementParts(dbManager, finalPostQueryOperations, EntityClass, filters, isInternalCall);

    const tableName = getTableName(EntityClass.name);
    const tableAlias = dbManager.schema + '_' + EntityClass.name.toLowerCase();

    const selectStatement = [
      `SELECT ${columns} FROM (SELECT * FROM ${dbManager.schema}.${tableName}`,
      rootWhereClause,
      `LIMIT 1) AS ${tableAlias}`,
      joinClauses,
      outerSortClause,
      isSelectForUpdate ? dbManager.getUpdateForClause(tableAlias) : undefined
    ]
      .filter((sqlPart) => sqlPart)
      .join(' ');

    const result = await dbManager.tryExecuteQueryWithNamedParameters(selectStatement, filterValues);

    let entity, error = null;
    if (dbManager.getResultRows(result).length === 0 && ifEntityNotFoundReturn) {
      [entity, error] = await ifEntityNotFoundReturn();
    } else {
      if (dbManager.getResultRows(result).length === 0) {
        await tryCommitLocalTransactionIfNeeded(didStartTransaction, dbManager);
        return [
          null,
          createBackkErrorFromErrorCodeMessageAndStatus({
            ...BACKK_ERRORS.ENTITY_NOT_FOUND,
            message: `${EntityClass.name} with ${fieldName}: ${fieldValue} not found`
          })
        ];
      }

      entity = transformRowsToObjects(
        dbManager.getResultRows(result),
        EntityClass,
        finalPostQueryOperations,
        dbManager,
        isInternalCall
      )[0];
    }

    if (postHook) {
      await tryExecutePostHook(postHook, entity);
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
