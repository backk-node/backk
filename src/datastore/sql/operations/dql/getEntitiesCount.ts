import SqlFilter from '../../expressions/SqlFilter';
import AbstractSqlDataStore from '../../../AbstractSqlDataStore';
import createBackkErrorFromError from '../../../../errors/createBackkErrorFromError';
import getSqlSelectStatementParts from './utils/getSqlSelectStatementParts';
import DefaultPostQueryOperationsImpl from '../../../../types/postqueryoperations/DefaultPostQueryOperationsImpl';
import updateDbLocalTransactionCount from './utils/updateDbLocalTransactionCount';
import UserDefinedFilter from '../../../../types/userdefinedfilters/UserDefinedFilter';
import MongoDbFilter from '../../../mongodb/MongoDbFilter';
import convertFilterObjectToSqlEquals from './utils/convertFilterObjectToSqlEquals';
import getTableName from '../../../utils/getTableName';
import { PromiseErrorOr } from '../../../../types/PromiseErrorOr';
import getUserAccountIdFieldNameAndRequiredValue from '../../../utils/getUserAccountIdFieldNameAndRequiredValue';
import SqlEquals from '../../expressions/SqlEquals';

export default async function getEntitiesCount<T>(
  dataStore: AbstractSqlDataStore,
  filters: Array<MongoDbFilter<T> | SqlFilter | UserDefinedFilter> | object | undefined,
  EntityClass: new () => T
): PromiseErrorOr<number> {
  if (typeof filters === 'object' && !Array.isArray(filters)) {
    // noinspection AssignmentToFunctionParameterJS
    filters = convertFilterObjectToSqlEquals(filters);
  } else if (filters?.find((filter) => filter instanceof MongoDbFilter)) {
    throw new Error('filters must be an array of SqlExpressions and/or UserDefinedFilters');
  }

  updateDbLocalTransactionCount(dataStore);
  // noinspection AssignmentToFunctionParameterJS
  EntityClass = dataStore.getType(EntityClass);

  try {
    const [userAccountIdFieldName, userAccountId] = getUserAccountIdFieldNameAndRequiredValue(dataStore);
    if (userAccountIdFieldName && userAccountId !== undefined) {
      (filters as any).push(new SqlEquals({ [userAccountIdFieldName]: userAccountId }));
    }

    const { rootWhereClause, filterValues } = getSqlSelectStatementParts(
      dataStore,
      new DefaultPostQueryOperationsImpl(),
      EntityClass,
      filters as SqlFilter[] | UserDefinedFilter[] | undefined
    );

    const tableName = getTableName(EntityClass.name);
    const tableAlias = EntityClass.name.toLowerCase();

    const sqlStatement = [
      `SELECT COUNT(*) as count FROM ${dataStore.getSchema()}.${tableName} AS "${tableAlias}"`,
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
