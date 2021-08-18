import { BackkEntity } from "../../../../types/entities/BackkEntity";
import { PromiseErrorOr } from "../../../../types/PromiseErrorOr";
import AbstractSqlDataStore from "../../../AbstractSqlDataStore";
import tryStartLocalTransactionIfNeeded from "../transaction/tryStartLocalTransactionIfNeeded";
import createErrorFromErrorCodeMessageAndStatus
  from "../../../../errors/createErrorFromErrorCodeMessageAndStatus";
import { BACKK_ERRORS } from "../../../../errors/backkErrors";
import forEachAsyncParallel from "../../../../utils/forEachAsyncParallel";
import getEntityById from "../dql/getEntityById";
import tryCommitLocalTransactionIfNeeded from "../transaction/tryCommitLocalTransactionIfNeeded";
import tryRollbackLocalTransactionIfNeeded from "../transaction/tryRollbackLocalTransactionIfNeeded";
import isBackkError from "../../../../errors/isBackkError";
import createBackkErrorFromError from "../../../../errors/createBackkErrorFromError";
import cleanupLocalTransactionIfNeeded from "../transaction/cleanupLocalTransactionIfNeeded";
import { EntityPreHook } from "../../../hooks/EntityPreHook";
import { PostQueryOperations } from "../../../../types/postqueryoperations/PostQueryOperations";
import { PostHook } from "../../../hooks/PostHook";
import tryExecuteEntityPreHooks from "../../../hooks/tryExecuteEntityPreHooks";
import tryExecutePostHook from "../../../hooks/tryExecutePostHook";
import DefaultPostQueryOperations from "../../../../types/postqueryoperations/DefaultPostQueryOperations";

// noinspection FunctionTooLongJS
export default async function addFieldValues<T extends BackkEntity>(
  dataStore: AbstractSqlDataStore,
  _id: string,
  fieldName: string,
  fieldValues: (string | number | boolean)[],
  EntityClass: new () => T,
  options?: {
    entityPreHooks?: EntityPreHook<T> | EntityPreHook<T>[];
    postQueryOperations?: PostQueryOperations;
    postHook?: PostHook<T>;
  }
): PromiseErrorOr<null> {
  if (fieldName.includes('.')) {
    throw new Error('fieldName parameter may not contain dots, i.e. it cannot be a field path name');
  }
  // noinspection AssignmentToFunctionParameterJS
  EntityClass = dataStore.getType(EntityClass);
  let didStartTransaction = false;

  try {
    didStartTransaction = await tryStartLocalTransactionIfNeeded(dataStore);
    const [currentEntity, error] = await getEntityById(
      dataStore,
      _id,
      EntityClass,
      options?.postQueryOperations ?? new DefaultPostQueryOperations(),
      false,
      undefined,
      true,
      true
    );

    if (!currentEntity) {
      throw error;
    }

    await tryExecuteEntityPreHooks(options?.entityPreHooks ?? [], currentEntity);
    const promises = [];
    const foreignIdFieldName = EntityClass.name.charAt(0).toLowerCase() + EntityClass.name.slice(1) + 'Id';

    const numericId = parseInt(_id, 10);
    if (isNaN(numericId)) {
      // noinspection ExceptionCaughtLocallyJS
      throw createErrorFromErrorCodeMessageAndStatus({
        ...BACKK_ERRORS.INVALID_ARGUMENT,
        message: BACKK_ERRORS.INVALID_ARGUMENT.message + '_id: must be a numeric id'
      });
    }

    promises.push(
      forEachAsyncParallel(fieldValues, async (fieldValue: any) => {
        const insertStatement = `INSERT INTO ${dataStore.schema.toLowerCase()}.${EntityClass.name.toLowerCase() +
          '_' +
          fieldName.slice(0, -1).toLowerCase()} (id, ${foreignIdFieldName.toLowerCase()}, ${fieldName
          .slice(0, -1)
          .toLowerCase()}) VALUES(${
          currentEntity.data[fieldName].length
        }, ${dataStore.getValuePlaceholder(1)}, ${dataStore.getValuePlaceholder(2)})`;

        await dataStore.tryExecuteSql(insertStatement, [_id, fieldValue]);
      })
    );

    const columns = [];
    const values = [];

    if (currentEntity.data.version) {
      columns.push('version');
      values.push(currentEntity.data.version + 1);
    }

    if (currentEntity.data.lastModifiedTimestamp) {
      columns.push('lastModifiedTimestamp');
      values.push(new Date());
    }

    const setStatements = columns
      .map(
        (fieldName: string, index: number) =>
          fieldName.toLowerCase() + ' = ' + dataStore.getValuePlaceholder(index + 1)
      )
      .join(', ');

    if (setStatements) {
      let sqlStatement = `UPDATE ${dataStore.schema.toLowerCase()}.${EntityClass.name.toLowerCase()} SET ${setStatements}`;

      if (numericId !== undefined) {
        sqlStatement += ` WHERE _id = ${dataStore.getValuePlaceholder(columns.length + 1)}`;
      }

      promises.push(
        dataStore.tryExecuteQuery(sqlStatement, numericId === undefined ? values : [...values, numericId])
      );
    }

    await Promise.all(promises);

    if (options?.postHook) {
      await tryExecutePostHook(options?.postHook, null);
    }

    await tryCommitLocalTransactionIfNeeded(didStartTransaction, dataStore);
    return [null, null];
  } catch (errorOrBackkError) {
    await tryRollbackLocalTransactionIfNeeded(didStartTransaction, dataStore);
    return [
      null,
      isBackkError(errorOrBackkError) ? errorOrBackkError : createBackkErrorFromError(errorOrBackkError)
    ];
  } finally {
    cleanupLocalTransactionIfNeeded(didStartTransaction, dataStore);
  }
}
