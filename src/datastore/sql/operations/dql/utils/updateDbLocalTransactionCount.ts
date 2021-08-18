import AbstractDataStore from "../../../../AbstractDataStore";
import { getNamespace } from "cls-hooked";

export default function updateDbLocalTransactionCount(dataStore: AbstractDataStore) {
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
