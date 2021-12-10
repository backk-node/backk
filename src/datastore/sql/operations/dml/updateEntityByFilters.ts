import MongoDbFilter from "../../../mongodb/MongoDbFilter";
import SqlFilter from "../../expressions/SqlFilter";
import UserDefinedFilter from "../../../../types/userdefinedfilters/UserDefinedFilter";
import { PromiseErrorOr } from "../../../../types/PromiseErrorOr";
import convertFilterObjectToSqlEquals from "../dql/utils/convertFilterObjectToSqlEquals";
import tryStartLocalTransactionIfNeeded from "../transaction/tryStartLocalTransactionIfNeeded";
import tryGetWhereClause from "../dql/clauses/tryGetWhereClause";
import tryCommitLocalTransactionIfNeeded from "../transaction/tryCommitLocalTransactionIfNeeded";
import tryRollbackLocalTransactionIfNeeded from "../transaction/tryRollbackLocalTransactionIfNeeded";
import isBackkError from "../../../../errors/isBackkError";
import createBackkErrorFromError from "../../../../errors/createBackkErrorFromError";
import cleanupLocalTransactionIfNeeded from "../transaction/cleanupLocalTransactionIfNeeded";
import AbstractSqlDataStore from "../../../AbstractSqlDataStore";
import getFilterValues from "../dql/utils/getFilterValues";
import getClassPropertyNameToPropertyTypeNameMap
  from "../../../../metadata/getClassPropertyNameToPropertyTypeNameMap";
import { BackkEntity } from "../../../../types/entities/BackkEntity";
import { EntityPreHook } from "../../../hooks/EntityPreHook";
import { PostQueryOperations } from "../../../../types/postqueryoperations/PostQueryOperations";
import { PostHook } from "../../../hooks/PostHook";
import tryExecuteEntityPreHooks from "../../../hooks/tryExecuteEntityPreHooks";
import getEntityByFilters from "../dql/getEntityByFilters";
import tryExecutePostHook from "../../../hooks/tryExecutePostHook";
import DefaultPostQueryOperations from "../../../../types/postqueryoperations/DefaultPostQueryOperations";

// noinspection DuplicatedCode
export default async function updateEntityByFilters<T extends BackkEntity>(
  dataStore: AbstractSqlDataStore,
  filters: Array<MongoDbFilter<T> | SqlFilter | UserDefinedFilter> | Partial<T> | object,
  update: Partial<T>,
  EntityClass: new () => T,
  options?: {
    entityPreHooks?: EntityPreHook<T> | EntityPreHook<T>[];
    postQueryOperations?: PostQueryOperations;
    postHook?: PostHook<T>;
  }
): PromiseErrorOr<null> {
  if (typeof filters === 'object' && !Array.isArray(filters)) {
    // noinspection AssignmentToFunctionParameterJS
    filters = convertFilterObjectToSqlEquals(filters);
  } else if (filters.find((filter) => filter instanceof MongoDbFilter)) {
    throw new Error('filters must be an array of SqlExpressions and/or UserDefinedFilters');
  }

  const nonRootFilters = (filters as Array<MongoDbFilter<T> | SqlFilter | UserDefinedFilter>).find(
    (filter) => filter.subEntityPath !== ''
  );

  if (nonRootFilters) {
    throw new Error('All filters must have subEntityPath empty, ie. they must be root filters');
  }

  // noinspection AssignmentToFunctionParameterJS
  EntityClass = dataStore.getType(EntityClass);
  let didStartTransaction = false;

  try {
    didStartTransaction = await tryStartLocalTransactionIfNeeded(dataStore);

    const[currentEntity, error] = await getEntityByFilters(
      dataStore,
      filters,
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

    const whereClause = tryGetWhereClause(EntityClass, dataStore, '', filters as any);
    const filterValues = getFilterValues(filters as any);

    const setStatements = Object.keys(update).map(
      (fieldName: string) => fieldName.toLowerCase() + ' = :yy' + fieldName
    );

    const updateValues = Object.entries(update).reduce(
      (updateValues, [fieldName, fieldValue]) => ({
        ...updateValues,
        [`yy${fieldName}`]: fieldValue
      }),
      {}
    );

    const entityMetadata = getClassPropertyNameToPropertyTypeNameMap(EntityClass);

    if (Object.keys(entityMetadata).find((fieldName) => fieldName === 'version')) {
      setStatements.push('version = version + 1');
    }

    if (Object.keys(entityMetadata).find((fieldName) => fieldName === 'lastModifiedTimestamp')) {
      setStatements.push('lastmodifiedtimestamp = current_timestamp');
    }

    const setStatement = setStatements.join(', ');
    const sqlStatement = `UPDATE ${dataStore.getSchema().toLowerCase()}.${EntityClass.name.toLowerCase()} SET ${setStatement} ${whereClause}`;
    await dataStore.tryExecuteQueryWithNamedParameters(sqlStatement, { ...filterValues, ...updateValues });

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
