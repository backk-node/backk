import { DataStore } from "../../../../DataStore";
import { getNamespace } from "cls-hooked";

export default function updateDbLocalTransactionCount(dataStore: DataStore) {
  if (
    !dataStore.getClsNamespace()?.get('localTransaction') &&
    !dataStore.getClsNamespace()?.get('globalTransaction') &&
    !getNamespace('multipleServiceFunctionExecutions')?.get('globalTransaction')
  ) {
    dataStore
      .getClsNamespace()
      ?.set('dbLocalTransactionCount', dataStore.getClsNamespace()?.get('dbLocalTransactionCount') + 1);
  }
}
