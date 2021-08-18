import AbstractSqlDataStore from "../../../AbstractSqlDataStore";

export default async function tryRollbackLocalTransactionIfNeeded(isInTransaction: boolean, dataStore: AbstractSqlDataStore) {
  if (isInTransaction) {
    await dataStore.tryRollbackTransaction();
  }
}
