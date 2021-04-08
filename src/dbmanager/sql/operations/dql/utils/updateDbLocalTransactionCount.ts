import AbstractDbManager from "../../../../AbstractDbManager";
import { getNamespace } from "cls-hooked";

export default function updateDbLocalTransactionCount(dbManager: AbstractDbManager) {
  if (
    !dbManager.getClsNamespace()?.get('localTransaction') &&
    !dbManager.getClsNamespace()?.get('globalTransaction') &&
    !getNamespace('multipleServiceFunctionExecutions')?.get('globalTransaction')
  ) {
    dbManager
      .getClsNamespace()
      ?.set('dbLocalTransactionCount', dbManager.getClsNamespace()?.get('dbLocalTransactionCount') + 1);
  }
}
