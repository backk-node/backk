import { getNamespace } from "cls-hooked";
import AbstractDbManager from "../../../AbstractDbManager";

export default async function tryStartLocalTransactionIfNeeded(
  dbManager: AbstractDbManager
): Promise<boolean> {
  if (
    !getNamespace('multipleServiceFunctionExecutions')?.get('globalTransaction') &&
    !dbManager.getClsNamespace()?.get('globalTransaction') &&
    !dbManager.getClsNamespace()?.get('localTransaction')
  ) {
    await dbManager.tryBeginTransaction();
    dbManager.getClsNamespace()?.set('localTransaction', true);
    dbManager.getClsNamespace()?.set('session', dbManager.getClient()?.startSession());
    dbManager
      .getClsNamespace()
      ?.set('dbLocalTransactionCount', dbManager.getClsNamespace()?.get('dbLocalTransactionCount') + 1);
    return true;
  }

  return false;
}
