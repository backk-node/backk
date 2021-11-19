import tryGetProjection from "../../clauses/tryGetProjection";
import getSqlColumnFromProjection from "./getSqlColumnFromProjection";
import AbstractSqlDataStore from "../../../../../AbstractSqlDataStore";
import createErrorFromErrorCodeMessageAndStatus
  from "../../../../../../errors/createErrorFromErrorCodeMessageAndStatus";
import { backkErrors } from "../../../../../../errors/backkErrors";

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
      ...backkErrors.INVALID_ARGUMENT,
      message: backkErrors.INVALID_ARGUMENT.message + 'invalid sub pagination field: ' + fieldName
    });
  }

  return getSqlColumnFromProjection(projection);
}
