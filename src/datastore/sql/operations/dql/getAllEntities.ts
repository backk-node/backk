import AbstractSqlDataStore from '../../../AbstractSqlDataStore';
import transformRowsToObjects from './transformresults/transformRowsToObjects';
import createBackkErrorFromError from '../../../../errors/createBackkErrorFromError';
import { PostQueryOperations } from '../../../../types/postqueryoperations/PostQueryOperations';
import getSqlSelectStatementParts from './utils/getSqlSelectStatementParts';
import updateDbLocalTransactionCount from './utils/updateDbLocalTransactionCount';
import getTableName from '../../../utils/getTableName';
import { PromiseErrorOr } from '../../../../types/PromiseErrorOr';
import { getNamespace } from 'cls-hooked';
import { Many } from '../../../DataStore';
import { BackkEntity } from '../../../../types/entities/BackkEntity';
import createCurrentPageTokens from '../../../utils/createCurrentPageTokens';
import tryEnsurePreviousOrNextPageIsRequested from '../../../utils/tryEnsurePreviousOrNextPageIsRequested';
import EntityCountRequest from '../../../../types/EntityCountRequest';
import getUserAccountIdFieldNameAndRequiredValue
  from "../../../utils/getUserAccountIdFieldNameAndRequiredValue";

export default async function getAllEntities<T extends BackkEntity>(
  dataStore: AbstractSqlDataStore,
  EntityClass: new () => T,
  postQueryOperations: PostQueryOperations,
  allowFetchingOnlyPreviousOrNextPage: boolean,
  entityCountRequests?: EntityCountRequest[]
): PromiseErrorOr<Many<T>> {
  if (allowFetchingOnlyPreviousOrNextPage) {
    tryEnsurePreviousOrNextPageIsRequested(
      postQueryOperations.currentPageTokens,
      postQueryOperations.paginations
    );
  }

  updateDbLocalTransactionCount(dataStore);

  // noinspection AssignmentToFunctionParameterJS
  EntityClass = dataStore.getType(EntityClass);

  try {
    let isSelectForUpdate = false;

    if (
      getNamespace('multipleServiceFunctionExecutions')?.get('globalTransaction') ||
      dataStore.getClsNamespace()?.get('globalTransaction') ||
      dataStore.getClsNamespace()?.get('localTransaction')
    ) {
      isSelectForUpdate = true;
    }

    const {
      columns,
      joinClauses,
      rootSortClause,
      rootPaginationClause,
      outerSortClause
    } = getSqlSelectStatementParts(
      dataStore,
      postQueryOperations,
      EntityClass,
      undefined,
      entityCountRequests
    );

    const tableName = getTableName(EntityClass.name);
    const tableAlias =EntityClass.name.toLowerCase();

    const shouldReturnRootEntityCount = !!entityCountRequests?.find(
      (entityCountRequest) =>
        entityCountRequest.subEntityPath === '' || entityCountRequest.subEntityPath === '*'
    );

    const [userAccountIdFieldName, userAccountId] = getUserAccountIdFieldNameAndRequiredValue(dataStore);
    const whereClause =
      userAccountIdFieldName && userAccountId !== undefined
        ? ` WHERE ${dataStore.getSchema().toLowerCase()}.${EntityClass.name.toLowerCase()}.${userAccountIdFieldName} = ${dataStore.getValuePlaceholder(
          1
        )}`
        : '';

    const selectStatement = [
      `SELECT ${columns} FROM (SELECT *${
          shouldReturnRootEntityCount ? ', COUNT(*) OVER() AS _count' : ''
        } FROM ${dataStore.getSchema()}.${tableName}${whereClause}`,
      rootSortClause,
      rootPaginationClause,
      `) AS "${tableAlias}"`,
      joinClauses,
      outerSortClause,
      isSelectForUpdate ? dataStore.getUpdateForClause(tableAlias) : undefined
    ]
      .filter((sqlPart) => sqlPart)
      .join(' ');

    const result = await dataStore.executeSqlQueryOrThrow(selectStatement, whereClause ? [userAccountId] : undefined);

    const entities = transformRowsToObjects(
      dataStore.getResultRows(result),
      EntityClass,
      postQueryOperations,
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
