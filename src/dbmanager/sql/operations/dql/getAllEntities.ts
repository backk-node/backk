import AbstractSqlDbManager from '../../../AbstractSqlDbManager';
import transformRowsToObjects from './transformresults/transformRowsToObjects';
import createBackkErrorFromError from '../../../../errors/createBackkErrorFromError';
import { PostQueryOperations } from '../../../../types/postqueryoperations/PostQueryOperations';
import getSqlSelectStatementParts from './utils/getSqlSelectStatementParts';
import updateDbLocalTransactionCount from './utils/updateDbLocalTransactionCount';
import DefaultPostQueryOperations from '../../../../types/postqueryoperations/DefaultPostQueryOperations';
import Pagination from '../../../../types/postqueryoperations/Pagination';
import getTableName from '../../../utils/getTableName';
import { PromiseErrorOr } from '../../../../types/PromiseErrorOr';
import { getNamespace } from 'cls-hooked';
import { Many } from '../../../AbstractDbManager';
import { BackkEntity } from '../../../../types/entities/BackkEntity';
import createCurrentPageTokens from '../../../utils/createCurrentPageTokens';
import tryEnsurePreviousOrNextPageIsRequested from "../../../utils/tryEnsurePreviousOrNextPageIsRequested";

export default async function getAllEntities<T extends BackkEntity>(
  dbManager: AbstractSqlDbManager,
  EntityClass: new () => T,
  postQueryOperations: PostQueryOperations,
  allowFetchingOnlyPreviousOrNextPage: boolean
): PromiseErrorOr<Many<T>> {
  if (allowFetchingOnlyPreviousOrNextPage) {
    tryEnsurePreviousOrNextPageIsRequested(postQueryOperations.currentPageTokens, postQueryOperations.paginations);
  }

  updateDbLocalTransactionCount(dbManager);

  // noinspection AssignmentToFunctionParameterJS
  EntityClass = dbManager.getType(EntityClass);

  try {
    let isSelectForUpdate = false;

    if (
      getNamespace('multipleServiceFunctionExecutions')?.get('globalTransaction') ||
      dbManager.getClsNamespace()?.get('globalTransaction') ||
      dbManager.getClsNamespace()?.get('localTransaction')
    ) {
      isSelectForUpdate = true;
    }

    const { columns, joinClauses, rootSortClause, outerSortClause } = getSqlSelectStatementParts(
      dbManager,
      postQueryOperations,
      EntityClass
    );

    const tableName = getTableName(EntityClass.name);
    const tableAlias = dbManager.schema + '_' + EntityClass.name.toLowerCase();

    const selectStatement = [
      `SELECT ${columns} FROM (SELECT * FROM ${dbManager.schema}.${tableName}`,
      rootSortClause,
      `) AS ${tableAlias}`,
      joinClauses,
      outerSortClause,
      isSelectForUpdate ? dbManager.getUpdateForClause(tableAlias) : undefined
    ]
      .filter((sqlPart) => sqlPart)
      .join(' ');

    const result = await dbManager.tryExecuteQuery(selectStatement);

    const entities = transformRowsToObjects(
      dbManager.getResultRows(result),
      EntityClass,
      postQueryOperations,
      dbManager
    );

    return [
      {
        metadata: {
          currentPageTokens: allowFetchingOnlyPreviousOrNextPage
            ? createCurrentPageTokens(postQueryOperations.paginations)
            : undefined,
          entityCounts: undefined
        },
        data: entities
      },
      null
    ];
  } catch (error) {
    return [null, createBackkErrorFromError(error)];
  }
}
