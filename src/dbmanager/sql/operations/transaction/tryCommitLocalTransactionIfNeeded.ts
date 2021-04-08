import AbstractSqlDbManager from "../../../AbstractSqlDbManager";

export default async function tryCommitLocalTransactionIfNeeded(isInTransaction: boolean, dbManager: AbstractSqlDbManager) {
  if (isInTransaction) {
    await dbManager.tryCommitTransaction();
  }
}
