import AbstractDbManager from "../dbmanager/AbstractDbManager";
import BaseService from "../service/BaseService";
import forEachAsyncSequential from "../utils/forEachAsyncSequential";
import serviceFunctionAnnotationContainer
  from "../decorators/service/function/serviceFunctionAnnotationContainer";
import getClsNamespace from "../continuationlocalstorages/getClsNamespace";

export default async function tryExecuteOnStartUpTasks(controller: any, dbManager: AbstractDbManager) {
  const clsNamespace = getClsNamespace('serviceFunctionExecution');
  const [, error] = await clsNamespace.runAndReturn(async () => {
    await dbManager.tryReserveDbConnectionFromPool();

    const [, error]= await dbManager.executeInsideTransaction(async () => {
      const serviceNameToServiceEntries = Object.entries(controller).filter(
        ([, service]: [string, any]) => service instanceof BaseService
      );

      try {
        await forEachAsyncSequential(serviceNameToServiceEntries, async ([, service]: [string, any]) => {
          await forEachAsyncSequential(
            Object.getOwnPropertyNames(Object.getPrototypeOf(service)),
            async (functionName: string) => {
              if (serviceFunctionAnnotationContainer.hasOnStartUp(service.constructor, functionName)) {
                const [, error] = await service[functionName]();

                if (error) {
                  throw error;
                }
              }
            }
          );
        });
      } catch (error) {
        return [null, error];
      }

      return [null, null];
    });

    dbManager.tryReleaseDbConnectionBackToPool();
    return [null, error];
  });

  if (error) {
    throw new Error(error.message);
  }
}
