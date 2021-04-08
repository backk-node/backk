import SqlExpression from "../../expressions/SqlExpression";
import AbstractSqlDbManager from "../../../AbstractSqlDbManager";
import createBackkErrorFromError from "../../../../errors/createBackkErrorFromError";
import getSqlSelectStatementParts from "./utils/getSqlSelectStatementParts";
import DefaultPostQueryOperations from "../../../../types/postqueryoperations/DefaultPostQueryOperations";
import updateDbLocalTransactionCount from "./utils/updateDbLocalTransactionCount";
import UserDefinedFilter from "../../../../types/userdefinedfilters/UserDefinedFilter";
import MongoDbQuery from "../../../mongodb/MongoDbQuery";
import convertFilterObjectToSqlEquals from "./utils/convertFilterObjectToSqlEquals";
import getTableName from "../../../utils/getTableName";
import { PromiseErrorOr } from "../../../../types/PromiseErrorOr";

export default async function getEntitiesCount<T>(
  dbManager: AbstractSqlDbManager,
  filters: Array<MongoDbQuery<T> | SqlExpression | UserDefinedFilter> | object | undefined,
  EntityClass: new () => T
): PromiseErrorOr<number> {
  if (typeof filters === 'object' && !Array.isArray(filters)) {
    // noinspection AssignmentToFunctionParameterJS
    filters = convertFilterObjectToSqlEquals(filters);
  } else if (filters?.find((filter) => filter instanceof MongoDbQuery)) {
    throw new Error('filters must be an array of SqlExpressions and/or UserDefinedFilters');
  }

  updateDbLocalTransactionCount(dbManager);
  // noinspection AssignmentToFunctionParameterJS
  EntityClass = dbManager.getType(EntityClass);

  try {
    const { rootWhereClause, filterValues } = getSqlSelectStatementParts(
      dbManager,
      new DefaultPostQueryOperations(),
      EntityClass,
      filters as SqlExpression[] | UserDefinedFilter[] | undefined
    );

    const tableName = getTableName(EntityClass.name);
    const tableAlias = dbManager.schema + '_' + EntityClass.name.toLowerCase();

    const sqlStatement = [
      `SELECT COUNT(*) as count FROM ${dbManager.schema}.${tableName} AS ${tableAlias}`,
      rootWhereClause
    ]
      .filter((sqlPart) => sqlPart)
      .join(' ');

    const result = await dbManager.tryExecuteQueryWithNamedParameters(sqlStatement, filterValues);
    const entityCount = dbManager.getResultRows(result)[0].count;
    return [entityCount, null];
  } catch (error) {
    return [null, createBackkErrorFromError(error)];
  }
}
