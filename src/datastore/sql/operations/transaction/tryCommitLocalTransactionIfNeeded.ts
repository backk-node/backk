import AbstractSqlDataStore from "../../../AbstractSqlDataStore";

export default async function tryCommitLocalTransactionIfNeeded(isInTransaction: boolean, dataStore: AbstractSqlDataStore) {
  if (isInTransaction) {
    await dataStore.tryCommitTransaction();
  }
}
