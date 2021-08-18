import AbstractDataStore from "../../../AbstractDataStore";

export default function cleanupLocalTransactionIfNeeded(isInsideTransaction: boolean, dataStore: AbstractDataStore) {
  if (isInsideTransaction) {
    dataStore.getClsNamespace()?.set('localTransaction', false);
    dataStore.cleanupTransaction();
  }
}
