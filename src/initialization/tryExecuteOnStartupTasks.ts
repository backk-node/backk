import AbstractDataStore from "../datastore/AbstractDataStore";
import BaseService from "../services/BaseService";
import forEachAsyncSequential from "../utils/forEachAsyncSequential";
import serviceFunctionAnnotationContainer
  from "../decorators/service/function/serviceFunctionAnnotationContainer";
import getClsNamespace from "../continuationlocalstorage/getClsNamespace";
import throwIf from "../utils/exception/throwIf";

export default async function tryExecuteOnStartUpTasks(controller: any, dataStore: AbstractDataStore) {
  const clsNamespace = getClsNamespace('serviceFunctionExecution');
  const [, error] = await clsNamespace.runAndReturn(async () => {
    await dataStore.tryReserveDbConnectionFromPool();

    const [, error]= await dataStore.executeInsideTransaction(async () => {
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
                throwIf(error);
              }
            }
          );
        });
      } catch (error) {
        return [null, error];
      }

      return [null, null];
    });

    dataStore.tryReleaseDbConnectionBackToPool();
    return [null, error];
  });

  if (error) {
    throw new Error(error.message);
  }
}
