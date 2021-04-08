import { BackkEntity } from "../../types/entities/BackkEntity";
import { SubEntity } from "../../types/entities/SubEntity";
import { EntityPreHook } from "../hooks/EntityPreHook";
import { PostHook } from "../hooks/PostHook";
import { PostQueryOperations } from "../../types/postqueryoperations/PostQueryOperations";
import { PromiseErrorOr } from "../../types/PromiseErrorOr";
import tryExecuteEntityPreHooks from "../hooks/tryExecuteEntityPreHooks";
import MongoDbManager from "../MongoDbManager";
import startDbOperation from "../utils/startDbOperation";
import tryStartLocalTransactionIfNeeded from "../sql/operations/transaction/tryStartLocalTransactionIfNeeded";
import tryExecutePostHook from "../hooks/tryExecutePostHook";
import isBackkError from "../../errors/isBackkError";
import createBackkErrorFromError from "../../errors/createBackkErrorFromError";
import cleanupLocalTransactionIfNeeded from "../sql/operations/transaction/cleanupLocalTransactionIfNeeded";
import recordDbOperationDuration from "../utils/recordDbOperationDuration";
import { ObjectId } from "mongodb";
import MongoDbQuery from "./MongoDbQuery";
import getRootOperations from "./getRootOperations";
import convertMongoDbQueriesToMatchExpression from "./convertMongoDbQueriesToMatchExpression";
import typePropertyAnnotationContainer from "../../decorators/typeproperty/typePropertyAnnotationContainer";
import replaceIdStringsWithObjectIds from "./replaceIdStringsWithObjectIds";
import getClassPropertyNameToPropertyTypeNameMap
  from "../../metadata/getClassPropertyNameToPropertyTypeNameMap";
import SqlExpression from "../sql/expressions/SqlExpression";
import UserDefinedFilter from "../../types/userdefinedfilters/UserDefinedFilter";
import convertFilterObjectToMongoDbQueries from "./convertFilterObjectToMongoDbQueries";
import convertUserDefinedFiltersToMatchExpression from "./convertUserDefinedFiltersToMatchExpression";

export default async function removeSimpleSubEntityByIdFromEntityByFilters<T extends BackkEntity, U extends SubEntity>(
  dbManager: MongoDbManager,
  filters: Array<MongoDbQuery<T> | SqlExpression | UserDefinedFilter> | Partial<T> | object,
  subEntityPath: string,
  subEntityId: string,
  EntityClass: new () => T,
  options?: {
    entityPreHooks?: EntityPreHook<T> | EntityPreHook<T>[];
    postHook?: PostHook<T>;
    postQueryOperations?: PostQueryOperations;
  }
): PromiseErrorOr<null> {
  const dbOperationStartTimeInMillis = startDbOperation(dbManager, 'removeSubEntitiesByIdWhere');
  // noinspection AssignmentToFunctionParameterJS
  EntityClass = dbManager.getType(EntityClass);

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
    const rootFilters = getRootOperations(finalFilters, EntityClass, dbManager.getTypes());
    const rootUserDefinedFilters = rootFilters.filter((filter) => !(filter instanceof MongoDbQuery));
    const rootMongoDbQueries = rootFilters.filter((filter) => filter instanceof MongoDbQuery);

    const userDefinedFiltersMatchExpression = convertUserDefinedFiltersToMatchExpression(
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
  let shouldUseTransaction = false;

  try {
    shouldUseTransaction = await tryStartLocalTransactionIfNeeded(dbManager);

    return await dbManager.tryExecute(shouldUseTransaction, async (client) => {
      if (options?.entityPreHooks) {
        const [currentEntity, error] = await dbManager.getEntityByFilters(
          EntityClass,
          filters,
          undefined,
          true
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

      const isManyToMany = typePropertyAnnotationContainer.isTypePropertyManyToMany(
        EntityClass,
        subEntityPath
      );

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
        .updateOne(matchExpression, { ...versionUpdate, ...lastModifiedTimestampUpdate, $pull: pullCondition });

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
