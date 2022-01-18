import { BackkEntity } from '../../types/entities/BackkEntity';
import { EntityPreHook } from '../hooks/EntityPreHook';
import { PostHook } from '../hooks/PostHook';
import { PostQueryOperations } from '../../types/postqueryoperations/PostQueryOperations';
import { PromiseErrorOr } from '../../types/PromiseErrorOr';
import tryExecuteEntityPreHooks from '../hooks/tryExecuteEntityPreHooks';
import MongoDbDataStore from '../MongoDbDataStore';
import tryStartLocalTransactionIfNeeded from '../sql/operations/transaction/tryStartLocalTransactionIfNeeded';
import tryExecutePostHook from '../hooks/tryExecutePostHook';
import isBackkError from '../../errors/isBackkError';
import createBackkErrorFromError from '../../errors/createBackkErrorFromError';
import cleanupLocalTransactionIfNeeded from '../sql/operations/transaction/cleanupLocalTransactionIfNeeded';
import { MongoClient, ObjectId } from 'mongodb';
import getClassPropertyNameToPropertyTypeNameMap from '../../metadata/getClassPropertyNameToPropertyTypeNameMap';
import DefaultPostQueryOperationsImpl from '../../types/postqueryoperations/DefaultPostQueryOperationsImpl';

export default async function removeFieldValues<T extends BackkEntity>(
  client: MongoClient,
  dataStore: MongoDbDataStore,
  _id: string,
  fieldName: string,
  fieldValues: (string | number | boolean)[],
  EntityClass: new () => T,
  options?: {
    entityPreHooks?: EntityPreHook<T> | EntityPreHook<T>[];
    postHook?: PostHook<T>;
    postQueryOperations?: PostQueryOperations;
  }
): PromiseErrorOr<null> {
  // noinspection AssignmentToFunctionParameterJS
  EntityClass = dataStore.getType(EntityClass);
  let shouldUseTransaction = false;

  try {
    shouldUseTransaction = await tryStartLocalTransactionIfNeeded(dataStore);

    return await dataStore.executeMongoDbOperationsOrThrow(shouldUseTransaction, async (client) => {
      if (options?.entityPreHooks) {
        const [currentEntity, error] = await dataStore.getEntityById(
          EntityClass,
          _id,
          options?.postQueryOperations ?? new DefaultPostQueryOperationsImpl(),
          false,
          undefined
        );
        if (!currentEntity) {
          throw error;
        }
        await tryExecuteEntityPreHooks(options?.entityPreHooks ?? [], currentEntity);
      }

      const entityPropertyNameToPropertyTypeNameMap = getClassPropertyNameToPropertyTypeNameMap(EntityClass);
      let versionUpdate = {};
      if (entityPropertyNameToPropertyTypeNameMap.version) {
        // noinspection ReuseOfLocalVariableJS
        versionUpdate = { $inc: { version: 1 } };
      }

      let lastModifiedTimestampUpdate = {};
      if (entityPropertyNameToPropertyTypeNameMap.lastModifiedTimestamp) {
        lastModifiedTimestampUpdate = { $set: { lastModifiedTimestamp: new Date() } };
      }

      await client
        .db(dataStore.getDbName())
        .collection(EntityClass.name.toLowerCase())
        .updateOne(
          { _id: new ObjectId(_id) },
          { ...versionUpdate, ...lastModifiedTimestampUpdate, $pull: { [fieldName]: { $in: fieldValues } } }
        );

      if (options?.postHook) {
        await tryExecutePostHook(options.postHook, null);
      }

      return [null, null];
    });
  } catch (errorOrBackkError) {
    return isBackkError(errorOrBackkError)
      ? [null, errorOrBackkError]
      : [null, createBackkErrorFromError(errorOrBackkError)];
  } finally {
    cleanupLocalTransactionIfNeeded(shouldUseTransaction, dataStore);
  }
}
