import forEachAsyncParallel from '../../../../utils/forEachAsyncParallel';
import entityContainer, { EntityJoinSpec } from '../../../../decorators/entity/entityAnnotationContainer';
import AbstractSqlDataStore from '../../../AbstractSqlDataStore';
import getEntityById from '../dql/getEntityById';
import createBackkErrorFromError from '../../../../errors/createBackkErrorFromError';
import tryStartLocalTransactionIfNeeded from '../transaction/tryStartLocalTransactionIfNeeded';
import tryCommitLocalTransactionIfNeeded from '../transaction/tryCommitLocalTransactionIfNeeded';
import tryRollbackLocalTransactionIfNeeded from '../transaction/tryRollbackLocalTransactionIfNeeded';
import cleanupLocalTransactionIfNeeded from '../transaction/cleanupLocalTransactionIfNeeded';
import { PostHook } from '../../../hooks/PostHook';
import tryExecutePostHook from '../../../hooks/tryExecutePostHook';
import createErrorFromErrorCodeMessageAndStatus from '../../../../errors/createErrorFromErrorCodeMessageAndStatus';
import { BACKK_ERRORS } from '../../../../errors/backkErrors';
import { BackkEntity } from '../../../../types/entities/BackkEntity';
import { PromiseErrorOr } from '../../../../types/PromiseErrorOr';
import isBackkError from '../../../../errors/isBackkError';
import { PostQueryOperations } from '../../../../types/postqueryoperations/PostQueryOperations';
import { EntityPreHook } from '../../../hooks/EntityPreHook';
import tryExecuteEntityPreHooks from '../../../hooks/tryExecuteEntityPreHooks';
import DefaultPostQueryOperations from '../../../../types/postqueryoperations/DefaultPostQueryOperations';
import getUserAccountIdFieldNameAndRequiredValue from '../../../utils/getUserAccountIdFieldNameAndRequiredValue';

export default async function deleteEntityById<T extends BackkEntity>(
  dataStore: AbstractSqlDataStore,
  _id: string,
  EntityClass: new () => T,
  entityPreHooks?: EntityPreHook<T> | EntityPreHook<T>[],
  postHook?: PostHook<T>,
  postQueryOperations?: PostQueryOperations,
  isRecursive = false
): PromiseErrorOr<null> {
  // noinspection AssignmentToFunctionParameterJS
  EntityClass = dataStore.getType(EntityClass);
  let didStartTransaction = false;

  try {
    didStartTransaction = await tryStartLocalTransactionIfNeeded(dataStore);
    let currentEntity, error;
    const [userAccountIdFieldName, userAccountId] = getUserAccountIdFieldNameAndRequiredValue(dataStore);

    if (entityPreHooks || (userAccountIdFieldName && userAccountId !== undefined)) {
      [currentEntity, error] = await getEntityById(
        dataStore,
        _id,
        EntityClass,
        postQueryOperations ?? new DefaultPostQueryOperations(),
        false,
        undefined,
        true,
        true
      );

      if (!currentEntity) {
        throw error;
      }

      if (entityPreHooks) {
        await tryExecuteEntityPreHooks(entityPreHooks, currentEntity);
      }
    }

    const numericId = parseInt(_id, 10);
    if (isNaN(numericId)) {
      // noinspection ExceptionCaughtLocallyJS
      throw createErrorFromErrorCodeMessageAndStatus({
        ...BACKK_ERRORS.INVALID_ARGUMENT,
        message: BACKK_ERRORS.INVALID_ARGUMENT.message + '_id: must be a numeric id'
      });
    }

    await Promise.all([
      forEachAsyncParallel(
        Object.values(entityContainer.entityNameToJoinsMap[EntityClass.name] || {}),
        async (joinSpec: EntityJoinSpec) => {
          if (!joinSpec.isReadonly) {
            await dataStore.tryExecuteSql(
              `DELETE FROM ${dataStore.getSchema().toLowerCase()}.${joinSpec.subEntityTableName.toLowerCase()} WHERE ${joinSpec.subEntityForeignIdFieldName.toLowerCase()} = ${dataStore.getValuePlaceholder(
                1
              )}`,
              [numericId]
            );
          }
        }
      ),
      forEachAsyncParallel(
        entityContainer.manyToManyRelationTableSpecs,
        async ({ associationTableName, entityForeignIdFieldName }) => {
          if (associationTableName.startsWith(EntityClass.name + '_')) {
            const sqlStatement = `DELETE FROM ${dataStore.getSchema().toLowerCase()}.${associationTableName.toLowerCase()} WHERE ${entityForeignIdFieldName.toLowerCase()} = ${dataStore.getValuePlaceholder(
              1
            )}`;
            await dataStore.tryExecuteSql(sqlStatement, [numericId]);
          }
        }
      ),
      isRecursive
        ? Promise.resolve(undefined)
        : dataStore.tryExecuteSql(
            `DELETE FROM ${dataStore.getSchema().toLowerCase()}.${EntityClass.name.toLowerCase()} WHERE ${dataStore.getSchema().toLowerCase()}.${EntityClass.name.toLowerCase()}._id = ${dataStore.getValuePlaceholder(
              1
            )}`,
            [numericId]
          )
    ]);

    if (postHook) {
      await tryExecutePostHook(postHook, currentEntity);
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
