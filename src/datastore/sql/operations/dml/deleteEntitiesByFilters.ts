import forEachAsyncParallel from '../../../../utils/forEachAsyncParallel';
import entityContainer, { EntityJoinSpec } from '../../../../decorators/entity/entityAnnotationContainer';
import AbstractSqlDataStore from '../../../AbstractSqlDataStore';
import createBackkErrorFromError from '../../../../errors/createBackkErrorFromError';
import tryStartLocalTransactionIfNeeded from '../transaction/tryStartLocalTransactionIfNeeded';
import tryCommitLocalTransactionIfNeeded from '../transaction/tryCommitLocalTransactionIfNeeded';
import tryRollbackLocalTransactionIfNeeded from '../transaction/tryRollbackLocalTransactionIfNeeded';
import cleanupLocalTransactionIfNeeded from '../transaction/cleanupLocalTransactionIfNeeded';
import SqlExpression from '../../expressions/SqlExpression';
import UserDefinedFilter from '../../../../types/userdefinedfilters/UserDefinedFilter';
import tryGetWhereClause from '../dql/clauses/tryGetWhereClause';
import getFilterValues from '../dql/utils/getFilterValues';
import MongoDbQuery from '../../../mongodb/MongoDbQuery';
import convertFilterObjectToSqlEquals from '../dql/utils/convertFilterObjectToSqlEquals';
import { PromiseErrorOr } from '../../../../types/PromiseErrorOr';
import isBackkError from '../../../../errors/isBackkError';
import getRequiredUserAccountIdFieldNameAndValue from '../../../utils/getRrequiredUserAccountIdFieldNameAndValue';
import SqlEquals from '../../expressions/SqlEquals';

export default async function deleteEntitiesByFilters<T extends object>(
  dataStore: AbstractSqlDataStore,
  filters: Array<MongoDbQuery<T> | SqlExpression | UserDefinedFilter> | object,
  EntityClass: new () => T
): PromiseErrorOr<null> {
  if (typeof filters === 'object' && !Array.isArray(filters)) {
    // noinspection AssignmentToFunctionParameterJS
    filters = convertFilterObjectToSqlEquals(filters);
  } else if (filters.find((filter) => filter instanceof MongoDbQuery)) {
    throw new Error('filters must be an array of SqlExpressions and/or UserDefinedFilters');
  }

  const nonRootFilters = (filters as Array<MongoDbQuery<T> | SqlExpression | UserDefinedFilter>).find(
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

    const [userAccountIdFieldName, userAccountId] = getRequiredUserAccountIdFieldNameAndValue(dataStore);
    if (userAccountIdFieldName && userAccountId) {
      (filters as any).push(new SqlEquals({ [userAccountIdFieldName]: userAccountId }));
    }

    const whereClause = tryGetWhereClause(dataStore, '', filters as any);
    const filterValues = getFilterValues(filters as any);

    await Promise.all([
      forEachAsyncParallel(
        Object.values(entityContainer.entityNameToJoinsMap[EntityClass.name] || {}),
        async (joinSpec: EntityJoinSpec) => {
          if (!joinSpec.isReadonly) {
            await dataStore.tryExecuteQueryWithNamedParameters(
              `DELETE FROM ${dataStore.schema.toLowerCase()}.${joinSpec.subEntityTableName.toLowerCase()} WHERE ${joinSpec.subEntityForeignIdFieldName.toLowerCase()} IN (SELECT _id FROM ${dataStore.schema.toLowerCase()}.${EntityClass.name.toLowerCase()} ${whereClause})`,
              filterValues
            );
          }
        }
      ),
      forEachAsyncParallel(
        entityContainer.manyToManyRelationTableSpecs,
        async ({ associationTableName, entityForeignIdFieldName }) => {
          if (associationTableName.startsWith(EntityClass.name + '_')) {
            await dataStore.tryExecuteQueryWithNamedParameters(
              `DELETE FROM ${dataStore.schema.toLowerCase()}.${associationTableName.toLowerCase()} WHERE ${entityForeignIdFieldName.toLowerCase()} IN (SELECT _id FROM ${dataStore.schema.toLowerCase()}.${EntityClass.name.toLowerCase()} ${whereClause})`,
              filterValues
            );
          }
        }
      ),
      dataStore.tryExecuteQueryWithNamedParameters(
        `DELETE FROM ${dataStore.schema.toLowerCase()}.${EntityClass.name.toLowerCase()} ${whereClause}`,
        filterValues
      )
    ]);

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
