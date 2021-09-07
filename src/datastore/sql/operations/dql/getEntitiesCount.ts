import SqlExpression from '../../expressions/SqlExpression';
import AbstractSqlDataStore from '../../../AbstractSqlDataStore';
import createBackkErrorFromError from '../../../../errors/createBackkErrorFromError';
import getSqlSelectStatementParts from './utils/getSqlSelectStatementParts';
import DefaultPostQueryOperations from '../../../../types/postqueryoperations/DefaultPostQueryOperations';
import updateDbLocalTransactionCount from './utils/updateDbLocalTransactionCount';
import UserDefinedFilter from '../../../../types/userdefinedfilters/UserDefinedFilter';
import MongoDbQuery from '../../../mongodb/MongoDbQuery';
import convertFilterObjectToSqlEquals from './utils/convertFilterObjectToSqlEquals';
import getTableName from '../../../utils/getTableName';
import { PromiseErrorOr } from '../../../../types/PromiseErrorOr';
import getUserAccountIdFieldNameAndRequiredValue from '../../../utils/getUserAccountIdFieldNameAndRequiredValue';
import SqlEquals from '../../expressions/SqlEquals';

export default async function getEntitiesCount<T>(
  dataStore: AbstractSqlDataStore,
  filters: Array<MongoDbQuery<T> | SqlExpression | UserDefinedFilter> | object | undefined,
  EntityClass: new () => T
): PromiseErrorOr<number> {
  if (typeof filters === 'object' && !Array.isArray(filters)) {
    // noinspection AssignmentToFunctionParameterJS
    filters = convertFilterObjectToSqlEquals(filters);
  } else if (filters?.find((filter) => filter instanceof MongoDbQuery)) {
    throw new Error('filters must be an array of SqlExpressions and/or UserDefinedFilters');
  }

  updateDbLocalTransactionCount(dataStore);
  // noinspection AssignmentToFunctionParameterJS
  EntityClass = dataStore.getType(EntityClass);

  try {
    const [userAccountIdFieldName, userAccountId] = getUserAccountIdFieldNameAndRequiredValue(dataStore);
    if (userAccountIdFieldName && userAccountId) {
      (filters as any).push(new SqlEquals({ [userAccountIdFieldName]: userAccountId }));
    }

    const { rootWhereClause, filterValues } = getSqlSelectStatementParts(
      dataStore,
      new DefaultPostQueryOperations(),
      EntityClass,
      filters as SqlExpression[] | UserDefinedFilter[] | undefined
    );

    const tableName = getTableName(EntityClass.name);
    const tableAlias = dataStore.schema + '_' + EntityClass.name.toLowerCase();

    const sqlStatement = [
      `SELECT COUNT(*) as count FROM ${dataStore.schema}.${tableName} AS ${tableAlias}`,
      rootWhereClause
    ]
      .filter((sqlPart) => sqlPart)
      .join(' ');

    const result = await dataStore.tryExecuteQueryWithNamedParameters(sqlStatement, filterValues);
    const entityCount = dataStore.getResultRows(result)[0].count;
    return [entityCount, null];
  } catch (error) {
    return [null, createBackkErrorFromError(error)];
  }
}
