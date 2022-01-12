import assertIsSortDirection from '../../../../../assertions/assertIsSortDirection';
import { BACKK_ERRORS } from '../../../../../errors/BACKK_ERRORS';
import createErrorFromErrorCodeMessageAndStatus from '../../../../../errors/createErrorFromErrorCodeMessageAndStatus';
import SortBy from '../../../../../types/postqueryoperations/SortBy';
import AbstractSqlDataStore from '../../../../AbstractSqlDataStore';
import tryGetProjection from './tryGetProjection';

export default function tryGetOrderByClause<T>(
  dataStore: AbstractSqlDataStore,
  subEntityPath: string,
  sortBys: SortBy[],
  EntityClass: new () => T,
  Types: object,
  tableAlias?: string
) {
  const sortBysForSubEntityPath = sortBys.filter(
    (sortBy) => sortBy.subEntityPath === subEntityPath || (subEntityPath === '' && !sortBy.subEntityPath)
  );

  const sortBysForAllSubEntityPaths = sortBys.filter((sortBy) => sortBy.subEntityPath === '*');

  const sortBysStr = [...sortBysForSubEntityPath, ...sortBysForAllSubEntityPaths]
    .map((sortBy) => {
      assertIsSortDirection(sortBy.sortDirection);

      let projection;
      if (sortBy.fieldName) {
        try {
          projection = tryGetProjection(
            dataStore,
            {
              includeResponseFields: [
                subEntityPath ? subEntityPath + '.' + sortBy.fieldName : sortBy.fieldName,
              ],
            },
            EntityClass,
            Types
          );
        } catch (error) {
          if (sortBy.subEntityPath !== '*') {
            throw createErrorFromErrorCodeMessageAndStatus({
              ...BACKK_ERRORS.INVALID_ARGUMENT,
              message: BACKK_ERRORS.INVALID_ARGUMENT.message + 'invalid sort field: ' + sortBy.fieldName,
            });
          }
        }
      }

      if (projection || sortBy.sortExpression) {
        if (tableAlias) {
          return (
            tableAlias.toLowerCase() +
            '.' +
            (sortBy.sortExpression || sortBy.fieldName) +
            (sortBy.sortDirection === 'DESC' ? ' ' + sortBy.sortDirection : '')
          );
        } else {
          return (
            (sortBy.sortExpression || sortBy.fieldName) +
            (sortBy.sortDirection === 'DESC' ? ' ' + sortBy.sortDirection : '')
          );
        }
      }

      return undefined;
    })
    .filter((sortByStr) => sortByStr)
    .join(', ');

  if (tableAlias) {
    return sortBysStr;
  } else {
    return sortBysStr ? `ORDER BY ${sortBysStr}` : '';
  }
}
