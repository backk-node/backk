import MongoDbQuery from '../../MongoDbQuery';
import UserDefinedFilter from '../../../../types/userdefinedfilters/UserDefinedFilter';
import SqlExpression from '../../../sql/expressions/SqlExpression';
import { PostQueryOperations } from '../../../../types/postqueryoperations/PostQueryOperations';
import { PromiseErrorOr } from '../../../../types/PromiseErrorOr';
import startDbOperation from '../../../utils/startDbOperation';
import updateDbLocalTransactionCount from '../../../sql/operations/dql/utils/updateDbLocalTransactionCount';
import convertFilterObjectToMongoDbQueries from '../../convertFilterObjectToMongoDbQueries';
import getRootOperations from '../../getRootOperations';
import convertUserDefinedFiltersToMatchExpression from '../../convertUserDefinedFiltersToMatchExpression';
import convertMongoDbQueriesToMatchExpression from '../../convertMongoDbQueriesToMatchExpression';
import replaceIdStringsWithObjectIds from '../../replaceIdStringsWithObjectIds';
import { getNamespace } from 'cls-hooked';
import { ObjectId } from 'mongodb';
import getJoinPipelines from '../../getJoinPipelines';
import getTableName, { getEntityName } from '../../../utils/getTableName';
import getFieldOrdering from '../../getFieldOrdering';
import performPostQueryOperations from '../../performPostQueryOperations';
import tryFetchAndAssignSubEntitiesForManyToManyRelationships from '../../tryFetchAndAssignSubEntitiesForManyToManyRelationships';
import paginateSubEntities from '../../paginateSubEntities';
import removePrivateProperties from '../../removePrivateProperties';
import decryptEntities from '../../../../crypt/decryptEntities';
import isBackkError from '../../../../errors/isBackkError';
import createBackkErrorFromError from '../../../../errors/createBackkErrorFromError';
import recordDbOperationDuration from '../../../utils/recordDbOperationDuration';
import MongoDbDataStore from '../../../MongoDbDataStore';
import { PreHook } from '../../../hooks/PreHook';
import tryStartLocalTransactionIfNeeded from '../../../sql/operations/transaction/tryStartLocalTransactionIfNeeded';
import tryExecutePreHooks from '../../../hooks/tryExecutePreHooks';
import { EntitiesPostHook } from '../../../hooks/EntitiesPostHook';
import tryExecuteEntitiesPostHook from '../../../hooks/tryExecuteEntitiesPostHook';
import { Many } from '../../../AbstractDataStore';
import { BackkEntity } from '../../../../types/entities/BackkEntity';
import createCurrentPageTokens from '../../../utils/createCurrentPageTokens';
import tryEnsurePreviousOrNextPageIsRequested from "../../../utils/tryEnsurePreviousOrNextPageIsRequested";
import EntityCountRequest from "../../../../types/EntityCountRequest";
import getUserAccountIdFieldNameAndRequiredValue
  from "../../../utils/getUserAccountIdFieldNameAndRequiredValue";

export default async function getEntitiesByFilters<T extends BackkEntity>(
  dataStore: MongoDbDataStore,
  filters: Array<MongoDbQuery<T> | UserDefinedFilter | SqlExpression> | Partial<T> | object,
  EntityClass: new () => T,
  postQueryOperations: PostQueryOperations,
  allowFetchingOnlyPreviousOrNextPage: boolean,
  options?: {
    preHooks?: PreHook | PreHook[];
    postHook?: EntitiesPostHook<T>;
    entityCountRequests?: EntityCountRequest[]
  },
  isRecursive = false,
  isInternalCall = false
): PromiseErrorOr<Many<T>> {
  const dbOperationStartTimeInMillis = startDbOperation(dataStore, 'getEntitiesByFilters');

  if (allowFetchingOnlyPreviousOrNextPage) {
    tryEnsurePreviousOrNextPageIsRequested(postQueryOperations.currentPageTokens, postQueryOperations.paginations);
  }

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
  // noinspection AssignmentToFunctionParameterJS
  EntityClass = dataStore.getType(EntityClass);
  const Types = dataStore.getTypes();
  let shouldUseTransaction = false;

  try {
    if (options?.preHooks || options?.postHook) {
      shouldUseTransaction = await tryStartLocalTransactionIfNeeded(dataStore);
    }

    const [userAccountIdFieldName, userAccountId] = getUserAccountIdFieldNameAndRequiredValue(dataStore);
    if (userAccountIdFieldName && userAccountId !== undefined) {
      matchExpression[userAccountIdFieldName] = new ObjectId(userAccountId);
    }

    if (!isRecursive) {
      updateDbLocalTransactionCount(dataStore);
    }

    let isSelectForUpdate = false;

    if (
      getNamespace('multipleServiceFunctionExecutions')?.get('globalTransaction') ||
      dataStore.getClsNamespace()?.get('globalTransaction') ||
      dataStore.getClsNamespace()?.get('localTransaction')
    ) {
      isSelectForUpdate = true;
    }

    const rows = await dataStore.tryExecute(shouldUseTransaction, async (client) => {
      if (isSelectForUpdate) {
        await client
          .db(dataStore.dbName)
          .collection(EntityClass.name.toLowerCase())
          .updateMany(matchExpression, { $set: { _backkLock: new ObjectId() } });
      }

      if (options?.preHooks) {
        await tryExecutePreHooks(options.preHooks);
      }

      const joinPipelines = getJoinPipelines(EntityClass, Types);
      const cursor = client
        .db(dataStore.dbName)
        .collection<T>(getTableName(EntityClass.name))
        .aggregate([...joinPipelines, getFieldOrdering((Types as any)[getEntityName(EntityClass.name)])])
        .match(matchExpression);

      performPostQueryOperations(cursor, postQueryOperations, EntityClass, Types);

      const shouldReturnRootEntityCount = !!options?.entityCountRequests?.find(
        (entityCountRequest) =>
          entityCountRequest.subEntityPath === '' || entityCountRequest.subEntityPath === '*'
      );

      const [rows, count] = await Promise.all([
        cursor.toArray(),
        shouldReturnRootEntityCount ? client
          .db(dataStore.dbName)
          .collection<T>(getTableName(EntityClass.name))
          .countDocuments(matchExpression) : Promise.resolve(undefined)
      ]);

      if (count !== undefined) {
        rows.forEach(row => {
          (row as any)._count = count;
        });
      }

      await tryFetchAndAssignSubEntitiesForManyToManyRelationships(
        dataStore,
        rows,
        EntityClass,
        dataStore.getTypes(),
        finalFilters as Array<MongoDbQuery<T>>,
        postQueryOperations,
        options?.entityCountRequests,
        isInternalCall
      );

      paginateSubEntities(rows, postQueryOperations.paginations, EntityClass, dataStore.getTypes());
      removePrivateProperties(rows, EntityClass, dataStore.getTypes(), isInternalCall);
      decryptEntities(rows, EntityClass, dataStore.getTypes(), false);
      return rows;
    });

    const entities = {
      metadata: {
        currentPageTokens: allowFetchingOnlyPreviousOrNextPage
          ? createCurrentPageTokens(postQueryOperations.paginations)
          : undefined
      },
      data: rows
    };

    if (options?.postHook) {
      await tryExecuteEntitiesPostHook(options.postHook, entities);
    }

    return [entities, null];
  } catch (errorOrBackkError) {
    return isBackkError(errorOrBackkError)
      ? [null, errorOrBackkError]
      : [null, createBackkErrorFromError(errorOrBackkError)];
  } finally {
    recordDbOperationDuration(dataStore, dbOperationStartTimeInMillis);
  }
}
