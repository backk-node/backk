import AbstractSqlDbManager from "../../../AbstractSqlDbManager";
import { RecursivePartial } from "../../../../types/RecursivePartial";
import createBackkErrorFromError from "../../../../errors/createBackkErrorFromError";
import { BackkEntity } from "../../../../types/entities/BackkEntity";
import tryStartLocalTransactionIfNeeded from "../transaction/tryStartLocalTransactionIfNeeded";
import tryCommitLocalTransactionIfNeeded from "../transaction/tryCommitLocalTransactionIfNeeded";
import tryRollbackLocalTransactionIfNeeded from "../transaction/tryRollbackLocalTransactionIfNeeded";
import cleanupLocalTransactionIfNeeded from "../transaction/cleanupLocalTransactionIfNeeded";
import getEntityWhere from "../dql/getEntityWhere";
import { PostHook } from "../../../hooks/PostHook";
import tryExecutePostHook from "../../../hooks/tryExecutePostHook";
import { PromiseErrorOr } from "../../../../types/PromiseErrorOr";
import isBackkError from "../../../../errors/isBackkError";
import { PostQueryOperations } from "../../../../types/postqueryoperations/PostQueryOperations";
import { EntityPreHook } from "../../../hooks/EntityPreHook";
import tryExecuteEntityPreHooks from "../../../hooks/tryExecuteEntityPreHooks";

export default async function updateEntityWhere<T extends BackkEntity>(
  dbManager: AbstractSqlDbManager,
  fieldPathName: string,
  fieldValue: any,
  entity: RecursivePartial<T>,
  EntityClass: new () => T,
  entityPreHooks?: EntityPreHook<T> | EntityPreHook<T>[],
  postHook?: PostHook<T>,
  postQueryOperations?: PostQueryOperations
): PromiseErrorOr<null> {
  // noinspection AssignmentToFunctionParameterJS
  EntityClass = dbManager.getType(EntityClass);
  let didStartTransaction = false;

  try {
    didStartTransaction = await tryStartLocalTransactionIfNeeded(dbManager);

    // eslint-disable-next-line prefer-const
    let [currentEntity, error] = await getEntityWhere(
      dbManager,
      fieldPathName,
      fieldValue,
      EntityClass,
      undefined,
      postQueryOperations,
      undefined,
      undefined,
      true
    );

    if (!currentEntity) {
      throw error;
    }

    await tryExecuteEntityPreHooks(entityPreHooks ?? [], currentEntity);

     [, error] = await dbManager.updateEntity(EntityClass, { _id: currentEntity?._id ?? "", ...entity });

    if (postHook) {
      await tryExecutePostHook(postHook, null);
    }

    await tryCommitLocalTransactionIfNeeded(didStartTransaction, dbManager);
    return [null, error];
  } catch (errorOrBackkError) {
    await tryRollbackLocalTransactionIfNeeded(didStartTransaction, dbManager);
    return [null, isBackkError(errorOrBackkError) ? errorOrBackkError : createBackkErrorFromError(errorOrBackkError)];
  } finally {
    cleanupLocalTransactionIfNeeded(didStartTransaction, dbManager);
  }
}
