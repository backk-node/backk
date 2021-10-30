import { getNamespace } from "cls-hooked";
import { DataStore } from "../../../DataStore";

export default async function tryStartLocalTransactionIfNeeded(
  dataStore: DataStore
): Promise<boolean> {
  if (
    !getNamespace('multipleServiceFunctionExecutions')?.get('globalTransaction') &&
    !dataStore.getClsNamespace()?.get('globalTransaction') &&
    !dataStore.getClsNamespace()?.get('localTransaction')
  ) {
    await dataStore.tryBeginTransaction();
    dataStore.getClsNamespace()?.set('localTransaction', true);
    dataStore.getClsNamespace()?.set('session', dataStore.getClient()?.startSession());
    dataStore
      .getClsNamespace()
      ?.set('dbLocalTransactionCount', dataStore.getClsNamespace()?.get('dbLocalTransactionCount') + 1);
    return true;
  }

  return false;
}
