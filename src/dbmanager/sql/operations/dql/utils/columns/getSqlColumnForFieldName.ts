import tryGetProjection from "../../clauses/tryGetProjection";
import getSqlColumnFromProjection from "./getSqlColumnFromProjection";
import AbstractSqlDbManager from "../../../../../AbstractSqlDbManager";
import createErrorFromErrorCodeMessageAndStatus
  from "../../../../../../errors/createErrorFromErrorCodeMessageAndStatus";
import { BACKK_ERRORS } from "../../../../../../errors/backkErrors";

export default function tryGetSqlColumnForFieldName(
  fieldName: string,
  dbManager: AbstractSqlDbManager,
  entityClass: Function,
  Types: object
): string {
  let projection;
  try {
    projection = tryGetProjection(dbManager, { includeResponseFields: [fieldName] }, entityClass, Types);
  } catch (error) {
    throw createErrorFromErrorCodeMessageAndStatus({
      ...BACKK_ERRORS.INVALID_ARGUMENT,
      message: BACKK_ERRORS.INVALID_ARGUMENT.message + 'invalid sub pagination field: ' + fieldName
    });
  }

  return getSqlColumnFromProjection(projection);
}
