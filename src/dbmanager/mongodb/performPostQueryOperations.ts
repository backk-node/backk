import { AggregationCursor, Cursor } from 'mongodb';
import { PostQueryOperations } from '../../types/postqueryoperations/PostQueryOperations';
import getProjection from './getProjection';
import getRootProjection from './getRootProjection';
import getRootOperations from './getRootOperations';
import SortBy from "../../types/postqueryoperations/SortBy";
import Pagination from "../../types/postqueryoperations/Pagination";

export default function performPostQueryOperations<T>(
  cursor: Cursor<T> | AggregationCursor<T>,
  postQueryOperations: PostQueryOperations | undefined,
  EntityClass: new () => T,
  Types: any
) {
  const projection = getProjection(EntityClass, postQueryOperations);
  const rootProjection = getRootProjection(projection, EntityClass, Types);

  if (Object.keys(rootProjection).length > 0) {
    cursor.project(rootProjection);
  }

  let sortBys = postQueryOperations?.sortBys;

  if (!sortBys) {
    sortBys = [new SortBy('*', '_id', 'ASC'), new SortBy('*', 'id', 'ASC')];
  }

  const rootSortBys = getRootOperations(sortBys, EntityClass, Types);

  if (rootSortBys.length > 0) {
    const sorting = rootSortBys.reduce(
      (accumulatedSortObj, { fieldName, sortDirection }) => ({
        ...accumulatedSortObj,
        [fieldName]: sortDirection === 'ASC' ? 1 : -1
      }),
      {}
    );

    cursor.sort(sorting);
  }

  let paginations = postQueryOperations?.paginations;

  if (!paginations) {
    paginations = [new Pagination('*', 1, 50)];
  }

  let rootPagination = paginations.find((pagination) => !pagination.subEntityPath);

  if (!rootPagination) {
    rootPagination = paginations.find((pagination) => pagination.subEntityPath === '*');
  }

  if (rootPagination) {
    cursor.skip((rootPagination.pageNumber - 1) * rootPagination.pageSize).limit(rootPagination.pageSize);
  }
}
