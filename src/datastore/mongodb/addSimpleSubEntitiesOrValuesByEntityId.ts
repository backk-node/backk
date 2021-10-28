import { BackkEntity } from '../../types/entities/BackkEntity';
import { SubEntity } from '../../types/entities/SubEntity';
import { EntityPreHook } from '../hooks/EntityPreHook';
import { PostHook } from '../hooks/PostHook';
import { PostQueryOperations } from '../../types/postqueryoperations/PostQueryOperations';
import { PromiseErrorOr } from '../../types/PromiseErrorOr';
import tryExecuteEntityPreHooks from '../hooks/tryExecuteEntityPreHooks';
import MongoDbDataStore from '../MongoDbDataStore';
import { MongoClient, ObjectId } from 'mongodb';
import typePropertyAnnotationContainer from '../../decorators/typeproperty/typePropertyAnnotationContainer';
import getClassPropertyNameToPropertyTypeNameMap from '../../metadata/getClassPropertyNameToPropertyTypeNameMap';
import { HttpStatusCodes } from '../../constants/constants';
import tryExecutePostHook from '../hooks/tryExecutePostHook';
import { One } from '../DataStore';
import DefaultPostQueryOperations from '../../types/postqueryoperations/DefaultPostQueryOperations';

export default async function addSimpleSubEntitiesOrValuesByEntityId<
  T extends BackkEntity,
  U extends SubEntity
>(
  client: MongoClient,
  dataStore: MongoDbDataStore,
  _id: string,
  subEntityPath: string,
  newSubEntities: Array<Omit<U, 'id'> | { _id: string } | string | number | boolean>,
  EntityClass: new () => T,
  options?: {
    ifEntityNotFoundUse?: () => PromiseErrorOr<One<T>>;
    entityPreHooks?: EntityPreHook<T> | EntityPreHook<T>[];
    postHook?: PostHook<T>;
    postQueryOperations?: PostQueryOperations;
  }
): PromiseErrorOr<null> {
  if (options?.entityPreHooks) {
    let [currentEntity, error] = await dataStore.getEntityById(
      EntityClass,
      _id,
      options?.postQueryOperations ?? new DefaultPostQueryOperations(),
      false,
      undefined,
      true,
      true
    );

    if (error?.statusCode === HttpStatusCodes.NOT_FOUND && options?.ifEntityNotFoundUse) {
      [currentEntity, error] = await options.ifEntityNotFoundUse();
    }

    if (!currentEntity) {
      return [null, error];
    }

    await tryExecuteEntityPreHooks(options?.entityPreHooks ?? [], currentEntity);
  }

  if (typePropertyAnnotationContainer.isTypePropertyManyToMany(EntityClass, subEntityPath)) {
    // noinspection AssignmentToFunctionParameterJS
    newSubEntities = newSubEntities.map((subEntity: any) => subEntity._id);
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
    .db(dataStore.dbName)
    .collection(EntityClass.name.toLowerCase())
    .updateOne(
      { _id: new ObjectId(_id) },
      {
        ...versionUpdate,
        ...lastModifiedTimestampUpdate,
        $push: { [subEntityPath]: { $each: newSubEntities } }
      }
    );

  if (options?.postHook) {
    await tryExecutePostHook(options.postHook, null);
  }

  return [null, null];
}
