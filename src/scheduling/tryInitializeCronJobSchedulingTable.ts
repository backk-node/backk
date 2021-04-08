import AbstractDbManager from "../dbmanager/AbstractDbManager";
import serviceFunctionAnnotationContainer
  from "../decorators/service/function/serviceFunctionAnnotationContainer";
// eslint-disable-next-line @typescript-eslint/camelcase
import __Backk__CronJobScheduling from "./entities/__Backk__CronJobScheduling";
import parser from "cron-parser";
import forEachAsyncParallel from "../utils/forEachAsyncParallel";
import { HttpStatusCodes } from "../constants/constants";
import getClsNamespace from "../continuationlocalstorages/getClsNamespace";

export default async function tryInitializeCronJobSchedulingTable(dbManager: AbstractDbManager) {
  const clsNamespace = getClsNamespace('serviceFunctionExecution');

  await forEachAsyncParallel(
    Object.entries(serviceFunctionAnnotationContainer.getServiceFunctionNameToCronScheduleMap()),
    async ([serviceFunctionName, cronSchedule]) => {
      const [, error] = await clsNamespace.runAndReturn(async () => {
        await dbManager.tryReserveDbConnectionFromPool();

        const [, error] = await dbManager.executeInsideTransaction(async () => {
          const [entity, error] = await dbManager.getEntityByFilters(
            __Backk__CronJobScheduling,
            {serviceFunctionName },
            undefined
          );

          const interval = parser.parseExpression(cronSchedule);

          if (error?.statusCode === HttpStatusCodes.NOT_FOUND) {
            return dbManager.createEntity(__Backk__CronJobScheduling, {
              serviceFunctionName,
              lastScheduledTimestamp: new Date(120000),
              nextScheduledTimestamp: interval.next().toDate()
            });
          } else if (entity) {
            return dbManager.updateEntity(__Backk__CronJobScheduling, {
              _id: entity._id,
              serviceFunctionName,
              lastScheduledTimestamp: new Date(120000),
              nextScheduledTimestamp: interval.next().toDate()
            });
          }

          return [entity, error];
        });

        dbManager.tryReleaseDbConnectionBackToPool();
        return [null, error];
      });

      if (error) {
        throw new Error(error.message);
      }
    }
  );
}
