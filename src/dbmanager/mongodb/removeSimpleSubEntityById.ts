import { BackkEntity } from '../../types/entities/BackkEntity';
import { SubEntity } from '../../types/entities/SubEntity';
import { EntityPreHook } from '../hooks/EntityPreHook';
import { PostHook } from '../hooks/PostHook';
import { PostQueryOperations } from '../../types/postqueryoperations/PostQueryOperations';
import { PromiseErrorOr } from '../../types/PromiseErrorOr';
import tryExecuteEntityPreHooks from '../hooks/tryExecuteEntityPreHooks';
import MongoDbManager from '../MongoDbManager';
import startDbOperation from '../utils/startDbOperation';
import tryStartLocalTransactionIfNeeded from '../sql/operations/transaction/tryStartLocalTransactionIfNeeded';
import tryExecutePostHook from '../hooks/tryExecutePostHook';
import isBackkError from '../../errors/isBackkError';
import createBackkErrorFromError from '../../errors/createBackkErrorFromError';
import cleanupLocalTransactionIfNeeded from '../sql/operations/transaction/cleanupLocalTransactionIfNeeded';
import recordDbOperationDuration from '../utils/recordDbOperationDuration';
import { ObjectId } from 'mongodb';
import typePropertyAnnotationContainer from '../../decorators/typeproperty/typePropertyAnnotationContainer';
import getClassPropertyNameToPropertyTypeNameMap from '../../metadata/getClassPropertyNameToPropertyTypeNameMap';

export default async function removeSimpleSubEntityById<T extends BackkEntity, U extends SubEntity>(
  dbManager: MongoDbManager,
  _id: string,
  subEntityPath: string,
  subEntityId: string,
  EntityClass: new () => T,
  options?: {
    entityPreHooks?: EntityPreHook<T> | EntityPreHook<T>[];
    postHook?: PostHook<T>;
    postQueryOperations?: PostQueryOperations;
  }
): PromiseErrorOr<null> {
  const dbOperationStartTimeInMillis = startDbOperation(dbManager, 'removeSubEntities');
  // noinspection AssignmentToFunctionParameterJS
  EntityClass = dbManager.getType(EntityClass);
  let shouldUseTransaction = false;

  try {
    shouldUseTransaction = await tryStartLocalTransactionIfNeeded(dbManager);

    return await dbManager.tryExecute(shouldUseTransaction, async (client) => {
      if (options?.entityPreHooks) {
        const [currentEntity, error] = await dbManager.getEntityById(EntityClass, _id, undefined);
        if (!currentEntity) {
          throw error;
        }

        await tryExecuteEntityPreHooks(options?.entityPreHooks ?? [], currentEntity);
      }

      const isManyToMany = typePropertyAnnotationContainer.isTypePropertyManyToMany(
        EntityClass,
        subEntityPath
      );

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

      const isMongoIdString = isNaN(parseInt(subEntityId, 10)) && subEntityId.length === 24;
      const pullCondition = isManyToMany
        ? { [subEntityPath]: subEntityId }
        : {
            [subEntityPath]: {
              [`${isMongoIdString ? '_id' : 'id'}`]: isMongoIdString ? new ObjectId(subEntityId) : subEntityId
            }
          };

      await client
        .db(dbManager.dbName)
        .collection(EntityClass.name.toLowerCase())
        .updateOne(
          { _id: new ObjectId(_id) },
          { ...versionUpdate, ...lastModifiedTimestampUpdate, $pull: pullCondition }
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
    cleanupLocalTransactionIfNeeded(shouldUseTransaction, dbManager);
    recordDbOperationDuration(dbManager, dbOperationStartTimeInMillis);
  }
}
