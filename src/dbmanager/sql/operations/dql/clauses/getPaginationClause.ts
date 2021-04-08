import assertIsNumber from "../../../../../assertions/assertIsNumber";
import Pagination from "../../../../../types/postqueryoperations/Pagination";
import createErrorFromErrorCodeMessageAndStatus
  from "../../../../../errors/createErrorFromErrorCodeMessageAndStatus";
import { BACKK_ERRORS } from "../../../../../errors/backkErrors";

export default function getPaginationClause(subEntityPath: string, paginations: Pagination[]) {
  let limitAndOffsetStatement = '';

  let pagination = paginations.find(
    (pagination) =>
      pagination.subEntityPath === subEntityPath || (subEntityPath === '' && !pagination.subEntityPath)
  );

  if (!pagination) {
    pagination = paginations.find((pagination) => pagination.subEntityPath === '*');
  }

  if (!pagination && subEntityPath === '') {
    throw createErrorFromErrorCodeMessageAndStatus({
      ...BACKK_ERRORS.INVALID_ARGUMENT,
      message: BACKK_ERRORS.INVALID_ARGUMENT.message + "missing pagination for root entity (subEntityPath: '')"
    });
  }

  if (pagination && pagination.pageSize !== Number.MAX_SAFE_INTEGER) {
    assertIsNumber('pageNumber', pagination.pageNumber);
    assertIsNumber('pageSize', pagination.pageSize);
    limitAndOffsetStatement = `LIMIT ${pagination.pageSize} OFFSET ${(pagination.pageNumber - 1) *
      pagination.pageSize}`;
  }

  return limitAndOffsetStatement;
}
