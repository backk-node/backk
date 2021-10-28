import DataStore from "../../../DataStore";

export default function cleanupLocalTransactionIfNeeded(isInsideTransaction: boolean, dataStore: DataStore) {
  if (isInsideTransaction) {
    dataStore.getClsNamespace()?.set('localTransaction', false);
    dataStore.cleanupTransaction();
  }
}
