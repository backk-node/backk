import AbstractSqlDataStore from '../../../../AbstractSqlDataStore';
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
import Pagination from '../../../../../types/postqueryoperations/Pagination';
import { Values } from '../../../../../constants/constants';
import EntityCountRequest from '../../../../../types/EntityCountRequest';

export default function getSqlSelectStatementParts<T>(
  dataStore: AbstractSqlDataStore,
  { sortBys, paginations, ...projection }: PostQueryOperations,
  EntityClass: new () => T,
  filters?: SqlExpression[] | UserDefinedFilter[],
  entityCountRequests?: EntityCountRequest[],
  isInternalCall = false
) {
  const Types = dataStore.getTypes();
  const columns = tryGetProjection(
    dataStore,
    projection,
    EntityClass,
    Types,
    entityCountRequests,
    isInternalCall
  );
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
    dataStore,
    '',
    projection,
    filters,
    sortBys,
    paginations,
    entityCountRequests,
    EntityClass,
    Types,
    outerSortBys,
    isInternalCall
  );

  const outerSortClause =
    outerSortBys.length > 0 ? `ORDER BY ${outerSortBys.filter((outerSortBy) => outerSortBy).join(', ')}` : '';

  const filterValues = getFilterValues(filters);
  const rootWhereClause = tryGetWhereClause(EntityClass, dataStore, '', filters);
  const rootSortClause = tryGetSortClause(dataStore, '', sortBys, EntityClass, Types);
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
