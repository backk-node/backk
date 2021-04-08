import AbstractSqlDbManager from '../../../../AbstractSqlDbManager';
import { PostQueryOperations } from '../../../../../types/postqueryoperations/PostQueryOperations';
import SqlExpression from '../../../expressions/SqlExpression';
import tryGetProjection from '../clauses/tryGetProjection';
import getJoinClauses from '../clauses/getJoinClauses';
import tryGetWhereClause from '../clauses/tryGetWhereClause';
import getFilterValues from './getFilterValues';
import tryGetSortClause from '../clauses/tryGetOrderByClause';
import UserDefinedFilter from '../../../../../types/userdefinedfilters/UserDefinedFilter';
import getPaginationClause from '../clauses/getPaginationClause';
import SortBy from '../../../../../types/postqueryoperations/SortBy';
import Pagination from "../../../../../types/postqueryoperations/Pagination";
import { Values } from "../../../../../constants/constants";

export default function getSqlSelectStatementParts<T>(
  dbManager: AbstractSqlDbManager,
  { sortBys, paginations, ...projection }: PostQueryOperations,
  EntityClass: new () => T,
  filters?: SqlExpression[] | UserDefinedFilter[],
  isInternalCall = false
) {
  const Types = dbManager.getTypes();
  const columns = tryGetProjection(dbManager, projection, EntityClass, Types, isInternalCall);
  const outerSortBys: string[] = [];

  if (!sortBys) {
    // noinspection AssignmentToFunctionParameterJS
    sortBys = [new SortBy('*', '_id', 'ASC'), new SortBy('*', 'id', 'ASC')];
  }

  if (!paginations) {
    // noinspection AssignmentToFunctionParameterJS
    paginations = [new Pagination('*', 1, Values._50)];
  }

  const joinClauses = getJoinClauses(
    dbManager,
    '',
    projection,
    filters,
    sortBys,
    paginations,
    EntityClass,
    Types,
    outerSortBys,
    isInternalCall
  );

  const outerSortClause =
    outerSortBys.length > 0 ? `ORDER BY ${outerSortBys.filter((outerSortBy) => outerSortBy).join(', ')}` : '';

  const filterValues = getFilterValues(filters);
  const rootWhereClause = tryGetWhereClause(dbManager, '', filters);
  const rootSortClause = tryGetSortClause(dbManager, '', sortBys, EntityClass, Types);
  const rootPaginationClause = getPaginationClause('', paginations);

  return {
    columns,
    joinClauses,
    rootWhereClause,
    filterValues,
    rootSortClause,
    rootPaginationClause,
    outerSortClause
  };
}
