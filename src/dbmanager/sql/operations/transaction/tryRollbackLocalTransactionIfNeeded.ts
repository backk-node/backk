import AbstractSqlDbManager from "../../../AbstractSqlDbManager";

export default async function tryRollbackLocalTransactionIfNeeded(isInTransaction: boolean, dbManager: AbstractSqlDbManager) {
  if (isInTransaction) {
    await dbManager.tryRollbackTransaction();
  }
}
