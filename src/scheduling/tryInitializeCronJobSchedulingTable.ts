import AbstractDataStore from "../datastore/AbstractDataStore";
import serviceFunctionAnnotationContainer
  from "../decorators/service/function/serviceFunctionAnnotationContainer";
// eslint-disable-next-line @typescript-eslint/camelcase
import __Backk__CronJobScheduling from "./entities/__Backk__CronJobScheduling";
import parser from "cron-parser";
import forEachAsyncParallel from "../utils/forEachAsyncParallel";
import { HttpStatusCodes } from "../constants/constants";
import getClsNamespace from "../continuationlocalstorage/getClsNamespace";
import DefaultPostQueryOperations from "../types/postqueryoperations/DefaultPostQueryOperations";

export default async function tryInitializeCronJobSchedulingTable(dataStore: AbstractDataStore) {
  const clsNamespace = getClsNamespace('serviceFunctionExecution');

  await forEachAsyncParallel(
    Object.entries(serviceFunctionAnnotationContainer.getServiceFunctionNameToCronScheduleMap()),
    async ([serviceFunctionName, cronSchedule]) => {
      const [, error] = await clsNamespace.runAndReturn(async () => {
        await dataStore.tryReserveDbConnectionFromPool();

        const [, error] = await dataStore.executeInsideTransaction(async () => {
          const [entity, error] = await dataStore.getEntityByFilters(
            __Backk__CronJobScheduling,
            {serviceFunctionName },
            new DefaultPostQueryOperations(1, Number.MAX_SAFE_INTEGER),
            false
          );

          const interval = parser.parseExpression(cronSchedule);

          if (error?.statusCode === HttpStatusCodes.NOT_FOUND) {
            return dataStore.createEntity(__Backk__CronJobScheduling, {
              serviceFunctionName,
              lastScheduledTimestamp: new Date(120000),
              nextScheduledTimestamp: interval.next().toDate()
            });
          } else if (entity) {
            return dataStore.updateEntity(__Backk__CronJobScheduling, {
              _id: entity.data._id,
              serviceFunctionName,
              lastScheduledTimestamp: new Date(120000),
              nextScheduledTimestamp: interval.next().toDate()
            });
          }

          return [entity, error];
        });

        dataStore.tryReleaseDbConnectionBackToPool();
        return [null, error];
      });

      if (error) {
        throw new Error(error.message);
      }
    }
  );
}
