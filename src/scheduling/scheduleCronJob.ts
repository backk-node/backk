import AbstractDbManager from "../dbmanager/AbstractDbManager";
import { CronJob } from "cron";
import findAsyncSequential from "../utils/findAsyncSequential";
import wait from "../utils/wait";
// eslint-disable-next-line @typescript-eslint/camelcase
import __Backk__JobScheduling from "./entities/__Backk__JobScheduling";
import tryExecuteServiceMethod from "../execution/tryExecuteServiceMethod";
import { logError } from "../observability/logging/log";
import getClsNamespace from "../continuationlocalstorages/getClsNamespace";

const scheduledJobs: { [key: string]: CronJob } = {};

export async function scheduleCronJob(
  scheduledExecutionTimestampAsDate: Date,
  retryIntervalsInSecs: number[],
  dbManager: AbstractDbManager,
  jobId: string,
  controller: any,
  serviceFunctionName: string,
  serviceFunctionArgument: any
) {
  const job = new CronJob(scheduledExecutionTimestampAsDate, async () => {
    await findAsyncSequential([0, ...retryIntervalsInSecs], async (retryIntervalInSecs) => {
      await wait(retryIntervalInSecs * 1000);
      const clsNamespace = getClsNamespace('multipleServiceFunctionExecutions');
      const clsNamespace2 = getClsNamespace('serviceFunctionExecution');
      return clsNamespace.runAndReturn(async () => {
        return clsNamespace2.runAndReturn(async () => {
          try {
            await dbManager.tryReserveDbConnectionFromPool();
            clsNamespace.set('connection', true);
            const possibleErrorResponse = await dbManager.executeInsideTransaction(async () => {
              clsNamespace.set('globalTransaction', true);

              const possibleErrorResponse = await dbManager.deleteEntityById(__Backk__JobScheduling, jobId, {
                entityPreHooks: (jobScheduling) => !!jobScheduling
              });

              return (
                possibleErrorResponse ||
                tryExecuteServiceMethod(
                  controller,
                  serviceFunctionName,
                  serviceFunctionArgument ?? {},
                  {},
                  undefined,
                  undefined,
                  false
                )
              );
            });
            clsNamespace.set('globalTransaction', true);

            if (possibleErrorResponse) {
              return false;
            } else {
              delete scheduledJobs[jobId];
              return true;
            }
          } catch (error) {
            logError(error);
            return false;
          } finally {
            dbManager.tryReleaseDbConnectionBackToPool();
            clsNamespace.set('connection', false);
          }
        });
      });
    });
  });

  scheduledJobs[jobId] = job;
  job.start();
}
