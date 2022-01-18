import { BackkEntity } from '../../../../types/entities/BackkEntity';
import { PromiseErrorOr } from '../../../../types/PromiseErrorOr';
import createErrorFromErrorCodeMessageAndStatus from '../../../../errors/createErrorFromErrorCodeMessageAndStatus';
import { BACKK_ERRORS } from '../../../../errors/BACKK_ERRORS';
import isBackkError from '../../../../errors/isBackkError';
import createBackkErrorFromError from '../../../../errors/createBackkErrorFromError';
import AbstractSqlDataStore from '../../../AbstractSqlDataStore';
import getTableName from '../../../utils/getTableName';
import getEntityById from './getEntityById';
import DefaultPostQueryOperationsImpl from '../../../../types/postqueryoperations/DefaultPostQueryOperationsImpl';
import getUserAccountIdFieldNameAndRequiredValue from '../../../utils/getUserAccountIdFieldNameAndRequiredValue';
import throwIf from '../../../../utils/exception/throwIf';

export default async function doesEntityArrayFieldContainValue<T extends BackkEntity>(
  dataStore: AbstractSqlDataStore,
  EntityClass: { new (): T },
  _id: string,
  fieldName: keyof T & string,
  fieldValue: string | number | boolean
): PromiseErrorOr<boolean> {
  if (fieldName.includes('.')) {
    throw new Error('fieldName parameter may not contain dots, i.e. it cannot be a field path value');
  }
  // noinspection AssignmentToFunctionParameterJS
  EntityClass = dataStore.getType(EntityClass);

  try {
    const [userAccountIdFieldName, userAccountId] = getUserAccountIdFieldNameAndRequiredValue(dataStore);

    if (userAccountIdFieldName && userAccountId !== undefined) {
      const [, error] = await getEntityById(
        dataStore,
        _id,
        EntityClass,
        new DefaultPostQueryOperationsImpl(),
        false
      );

      throwIf(error);
    }

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

    const selectStatement = `SELECT COUNT(*) as count FROM ${dataStore.getSchema().toLowerCase()}.${tableName +
      '_' +
      fieldName
        .slice(0, -1)
        .toLowerCase()} WHERE ${foreignIdFieldName.toLowerCase()} = ${dataStore.getValuePlaceholder(
      1
    )} AND ${fieldName.slice(0, -1).toLowerCase()} = ${dataStore.getValuePlaceholder(2)}`;

    const result = await dataStore.executeSqlQueryOrThrow(selectStatement, [numericId, fieldValue]);
    const entityCount = dataStore.getResultRows(result)[0].count;

    return [entityCount >= 1, null];
  } catch (errorOrBackkError) {
    return [
      null,
      isBackkError(errorOrBackkError) ? errorOrBackkError : createBackkErrorFromError(errorOrBackkError)
    ];
  }
}
