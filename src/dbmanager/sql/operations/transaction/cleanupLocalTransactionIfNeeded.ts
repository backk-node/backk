import AbstractDbManager from "../../../AbstractDbManager";

export default function cleanupLocalTransactionIfNeeded(isInsideTransaction: boolean, dbManager: AbstractDbManager) {
  if (isInsideTransaction) {
    dbManager.getClsNamespace()?.set('localTransaction', false);
    dbManager.cleanupTransaction();
  }
}
