import MongoDbFilter from '../../MongoDbFilter';
import UserDefinedFilter from '../../../../types/userdefinedfilters/UserDefinedFilter';
import SqlFilter from '../../../sql/filters/SqlFilter';
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
import { PostHook } from '../../../hooks/PostHook';
import createBackkErrorFromErrorCodeMessageAndStatus from '../../../../errors/createBackkErrorFromErrorCodeMessageAndStatus';
import { BACKK_ERRORS } from '../../../../errors/BACKK_ERRORS';
import tryExecutePostHook from '../../../hooks/tryExecutePostHook';
import { BackkEntity } from '../../../../types/entities/BackkEntity';
import { One } from '../../../DataStore';
import createCurrentPageTokens from '../../../utils/createCurrentPageTokens';
import tryEnsurePreviousOrNextPageIsRequested from '../../../utils/tryEnsurePreviousOrNextPageIsRequested';
import EntityCountRequest from '../../../../types/EntityCountRequest';
import getUserAccountIdFieldNameAndRequiredValue
  from "../../../utils/getUserAccountIdFieldNameAndRequiredValue";

export default async function getEntityByFilters<T extends BackkEntity>(
  dataStore: MongoDbDataStore,
  filters: Array<MongoDbFilter<T> | UserDefinedFilter | SqlFilter> | Partial<T> | object,
  EntityClass: new () => T,
  postQueryOperations: PostQueryOperations,
  allowFetchingOnlyPreviousOrNextPage: boolean,
  options?: {
    preHooks?: PreHook | PreHook[];
    ifEntityNotFoundReturn?: () => PromiseErrorOr<One<T>>;
    postHook?: PostHook<T>;
    entityCountRequests?: EntityCountRequest[];
  },
  isSelectForUpdate = false,
  isInternalCall = false
): PromiseErrorOr<One<T>> {
  const dbOperationStartTimeInMillis = startDbOperation(dataStore, 'getEntitiesByFilters');

  if (allowFetchingOnlyPreviousOrNextPage) {
    tryEnsurePreviousOrNextPageIsRequested(
      postQueryOperations.currentPageTokens,
      postQueryOperations.paginations
    );
  }

  let matchExpression: any;
  let finalFilters: Array<MongoDbFilter<T> | UserDefinedFilter | SqlFilter>;

  if (typeof filters === 'object' && !Array.isArray(filters)) {
    finalFilters = convertFilterObjectToMongoDbQueries(filters);
  } else {
    finalFilters = filters;
  }

  if (Array.isArray(finalFilters) && finalFilters?.find((filter) => filter instanceof SqlFilter)) {
    throw new Error('SqlFilter is not supported for MongoDB');
  } else {
    const rootFilters = getRootOperations(finalFilters, EntityClass, dataStore.getTypes());
    const rootUserDefinedFilters = rootFilters.filter((filter) => !(filter instanceof MongoDbFilter));
    const rootMongoDbQueries = rootFilters.filter((filter) => filter instanceof MongoDbFilter);

    const userDefinedFiltersMatchExpression = convertUserDefinedFiltersToMatchExpression(
      EntityClass,
      dataStore.getTypes(),
      rootUserDefinedFilters as UserDefinedFilter[]
    );

    const mongoDbQueriesMatchExpression = convertMongoDbQueriesToMatchExpression(
      rootMongoDbQueries as Array<MongoDbFilter<T>>
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
    if (options?.preHooks || options?.postHook || options?.ifEntityNotFoundReturn) {
      shouldUseTransaction = await tryStartLocalTransactionIfNeeded(dataStore);
    }

    const [userAccountIdFieldName, userAccountId] = getUserAccountIdFieldNameAndRequiredValue(dataStore);
    if (userAccountIdFieldName && userAccountId !== undefined) {
      matchExpression[userAccountIdFieldName] = userAccountIdFieldName === '_id' ? new ObjectId(userAccountId) : userAccountId;
    }

    updateDbLocalTransactionCount(dataStore);

    if (
      getNamespace('multipleServiceFunctionExecutions')?.get('globalTransaction') ||
      dataStore.getClsNamespace()?.get('globalTransaction') ||
      dataStore.getClsNamespace()?.get('localTransaction')
    ) {
      // noinspection AssignmentToFunctionParameterJS
      isSelectForUpdate = true;
    }

    return await dataStore.executeMongoDbOperationsOrThrow(shouldUseTransaction, async (client) => {
      if (isSelectForUpdate) {
        await client
          .db(dataStore.getDbName())
          .collection(EntityClass.name.toLowerCase())
          .updateMany(matchExpression, { $set: { _backkLock: new ObjectId() } });
      }

      if (options?.preHooks) {
        await tryExecutePreHooks(options.preHooks);
      }

      const joinPipelines = getJoinPipelines(EntityClass, Types);
      const cursor = client
        .db(dataStore.getDbName())
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
          .db(dataStore.getDbName())
          .collection<T>(getTableName(EntityClass.name))
          .countDocuments(matchExpression) : Promise.resolve(undefined)
      ]);

      if (count !== undefined) {
        rows.forEach((row: any) => {
          (row as any)._count = count;
        });
      }

      await tryFetchAndAssignSubEntitiesForManyToManyRelationships(
        dataStore,
        rows,
        EntityClass,
        dataStore.getTypes(),
        finalFilters as Array<MongoDbFilter<T>>,
        postQueryOperations,
        options?.entityCountRequests,
        isInternalCall
      );

      paginateSubEntities(rows, postQueryOperations?.paginations, EntityClass, dataStore.getTypes());
      removePrivateProperties(rows, EntityClass, dataStore.getTypes(), isInternalCall);
      decryptEntities(rows, EntityClass, dataStore.getTypes(), false);

      let entity: One<T> | null | undefined = {
        metadata: {
          currentPageTokens: allowFetchingOnlyPreviousOrNextPage
            ? createCurrentPageTokens(postQueryOperations?.paginations)
            : undefined
        },
        data: rows[0]
      };
      let error;

      if (!rows[0]) {
        if (options?.ifEntityNotFoundReturn) {
          [entity, error] = await options.ifEntityNotFoundReturn();
        } else {
          return [
            null,
            createBackkErrorFromErrorCodeMessageAndStatus({
              ...BACKK_ERRORS.ENTITY_NOT_FOUND,
              message: `${EntityClass.name} with given filter(s) not found`
            })
          ];
        }
      }

      if (options?.postHook) {
        await tryExecutePostHook(options?.postHook, entity);
      }

      return [entity, error];
    });
  } catch (errorOrBackkError) {
    return isBackkError(errorOrBackkError)
      ? [null, errorOrBackkError]
      : [null, createBackkErrorFromError(errorOrBackkError)];
  } finally {
    recordDbOperationDuration(dataStore, dbOperationStartTimeInMillis);
  }
}
