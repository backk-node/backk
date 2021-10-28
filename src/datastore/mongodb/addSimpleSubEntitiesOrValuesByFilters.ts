import { BackkEntity } from '../../types/entities/BackkEntity';
import { SubEntity } from '../../types/entities/SubEntity';
import { EntityPreHook } from '../hooks/EntityPreHook';
import { PostHook } from '../hooks/PostHook';
import { PostQueryOperations } from '../../types/postqueryoperations/PostQueryOperations';
import { PromiseErrorOr } from '../../types/PromiseErrorOr';
import tryExecuteEntityPreHooks from '../hooks/tryExecuteEntityPreHooks';
import MongoDbDataStore from '../MongoDbDataStore';
import { MongoClient } from 'mongodb';
import typePropertyAnnotationContainer from '../../decorators/typeproperty/typePropertyAnnotationContainer';
import getClassPropertyNameToPropertyTypeNameMap from '../../metadata/getClassPropertyNameToPropertyTypeNameMap';
import { HttpStatusCodes } from '../../constants/constants';
import MongoDbQuery from './MongoDbQuery';
import SqlExpression from '../sql/expressions/SqlExpression';
import UserDefinedFilter from '../../types/userdefinedfilters/UserDefinedFilter';
import convertFilterObjectToMongoDbQueries from './convertFilterObjectToMongoDbQueries';
import getRootOperations from './getRootOperations';
import convertUserDefinedFiltersToMatchExpression from './convertUserDefinedFiltersToMatchExpression';
import convertMongoDbQueriesToMatchExpression from './convertMongoDbQueriesToMatchExpression';
import replaceIdStringsWithObjectIds from './replaceIdStringsWithObjectIds';
import { One } from "../DataStore";
import DefaultPostQueryOperations from "../../types/postqueryoperations/DefaultPostQueryOperations";

export default async function addSimpleSubEntitiesOrValuesByFilters<
  T extends BackkEntity,
  U extends SubEntity
>(
  client: MongoClient,
  dataStore: MongoDbDataStore,
  filters: Array<MongoDbQuery<T> | SqlExpression | UserDefinedFilter> | Partial<T> | object,
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
  let matchExpression: any;
  let finalFilters: Array<MongoDbQuery<T> | UserDefinedFilter | SqlExpression>;

  if (typeof filters === 'object' && !Array.isArray(filters)) {
    finalFilters = convertFilterObjectToMongoDbQueries(filters);
  } else {
    finalFilters = filters;
  }

  if (Array.isArray(finalFilters) && finalFilters?.find((filter) => filter instanceof SqlExpression)) {
    throw new Error('SqlExpression is not supported for MongoDB');
  } else {
    const rootFilters = getRootOperations(finalFilters, EntityClass, dataStore.getTypes());
    const rootUserDefinedFilters = rootFilters.filter((filter) => !(filter instanceof MongoDbQuery));
    const rootMongoDbQueries = rootFilters.filter((filter) => filter instanceof MongoDbQuery);

    const userDefinedFiltersMatchExpression = convertUserDefinedFiltersToMatchExpression(
      EntityClass,
      dataStore.getTypes(),
      rootUserDefinedFilters as UserDefinedFilter[]
    );

    const mongoDbQueriesMatchExpression = convertMongoDbQueriesToMatchExpression(
      rootMongoDbQueries as Array<MongoDbQuery<T>>
    );

    matchExpression = {
      ...userDefinedFiltersMatchExpression,
      ...mongoDbQueriesMatchExpression
    };
  }

  replaceIdStringsWithObjectIds(matchExpression);

  if (options?.entityPreHooks) {
    let [currentEntity, error] = await dataStore.getEntityByFilters(
      EntityClass,
      filters,
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
    .updateOne(matchExpression, {
      ...versionUpdate,
      ...lastModifiedTimestampUpdate,
      $push: { [subEntityPath]: { $each: newSubEntities } }
    });

  return [null, null];
}
