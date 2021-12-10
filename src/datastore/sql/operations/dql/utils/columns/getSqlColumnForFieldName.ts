import tryGetProjection from "../../clauses/tryGetProjection";
import getSqlColumnFromProjection from "./getSqlColumnFromProjection";
import AbstractSqlDataStore from "../../../../../AbstractSqlDataStore";
import createErrorFromErrorCodeMessageAndStatus
  from "../../../../../../errors/createErrorFromErrorCodeMessageAndStatus";
import { BACKK_ERRORS } from "../../../../../../errors/BACKK_ERRORS";

export default function tryGetSqlColumnForFieldName(
  fieldName: string,
  dataStore: AbstractSqlDataStore,
  entityClass: Function,
  Types: object
): string {
  let projection;
  try {
    projection = tryGetProjection(dataStore, { includeResponseFields: [fieldName] }, entityClass, Types);
  } catch (error) {
    throw createErrorFromErrorCodeMessageAndStatus({
      ...BACKK_ERRORS.INVALID_ARGUMENT,
      message: BACKK_ERRORS.INVALID_ARGUMENT.message + 'invalid sub pagination field: ' + fieldName
    });
  }

  return getSqlColumnFromProjection(projection);
}
