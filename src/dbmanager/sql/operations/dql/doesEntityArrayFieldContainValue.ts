import { BackkEntity } from "../../../../types/entities/BackkEntity";
import { PromiseErrorOr } from "../../../../types/PromiseErrorOr";
import createErrorFromErrorCodeMessageAndStatus
  from "../../../../errors/createErrorFromErrorCodeMessageAndStatus";
import { BACKK_ERRORS } from "../../../../errors/backkErrors";
import isBackkError from "../../../../errors/isBackkError";
import createBackkErrorFromError from "../../../../errors/createBackkErrorFromError";
import AbstractSqlDbManager from "../../../AbstractSqlDbManager";
import { getNamespace } from "cls-hooked";
import getTableName from "../../../utils/getTableName";

export default async function doesEntityArrayFieldContainValue<T extends BackkEntity>(
  dbManager: AbstractSqlDbManager,
  EntityClass: { new (): T },
  _id: string,
  fieldName: keyof T & string,
  fieldValue: string | number | boolean
): PromiseErrorOr<boolean> {
  if (fieldName.includes('.')) {
    throw new Error('fieldName parameter may not contain dots, i.e. it cannot be a field path name');
  }
  // noinspection AssignmentToFunctionParameterJS
  EntityClass = dbManager.getType(EntityClass);

  try {
    const foreignIdFieldName = EntityClass.name.charAt(0).toLowerCase() + EntityClass.name.slice(1) + 'Id';
    const numericId = parseInt(_id, 10);
    if (isNaN(numericId)) {
      // noinspection ExceptionCaughtLocallyJS
      throw createErrorFromErrorCodeMessageAndStatus({
        ...BACKK_ERRORS.INVALID_ARGUMENT,
        message: BACKK_ERRORS.INVALID_ARGUMENT.message + '_id: must be a numeric id'
      });
    }

    const tableName = getTableName(EntityClass.name);

    const selectStatement = `SELECT COUNT(*) as count FROM ${dbManager.schema.toLowerCase()}.${tableName +
      '_' +
      fieldName
        .slice(0, -1)
        .toLowerCase()} WHERE ${foreignIdFieldName.toLowerCase()} = ${dbManager.getValuePlaceholder(
      1
    )} AND ${fieldName.slice(0, -1).toLowerCase()} = ${dbManager.getValuePlaceholder(2)}`;

    const result = await dbManager.tryExecuteQuery(selectStatement, [numericId, fieldValue]);
    const entityCount = dbManager.getResultRows(result)[0].count;

    return [entityCount >= 1, null];
  } catch (errorOrBackkError) {
    return [
      null,
      isBackkError(errorOrBackkError) ? errorOrBackkError : createBackkErrorFromError(errorOrBackkError)
    ];
  }
}
