import { CronJob } from "cron";
import parser from "cron-parser";
import AbstractDbManager from "../dbmanager/AbstractDbManager";
import serviceFunctionAnnotationContainer
  from "../decorators/service/function/serviceFunctionAnnotationContainer";
// eslint-disable-next-line @typescript-eslint/camelcase
import __Backk__CronJobScheduling from "./entities/__Backk__CronJobScheduling";
import findAsyncSequential from "../utils/findAsyncSequential";
import wait from "../utils/wait";
import { logError } from "../observability/logging/log";
import tryExecuteServiceMethod from "../execution/tryExecuteServiceMethod";
import findServiceFunctionArgumentType from "../metadata/findServiceFunctionArgumentType";
import BackkResponse from "../execution/BackkResponse";
import { HttpStatusCodes, Values } from "../constants/constants";
import getClsNamespace from "../continuationlocalstorages/getClsNamespace";

const cronJobs: { [key: string]: CronJob } = {};

export default function scheduleCronJobsForExecution(controller: any, dbManager: AbstractDbManager) {
  if (process.env.NODE_ENV === 'development') {
    return;
  }

  Object.entries(serviceFunctionAnnotationContainer.getServiceFunctionNameToCronScheduleMap()).forEach(
    ([serviceFunctionName, cronSchedule]) => {
      const job = new CronJob(cronSchedule, async () => {
        const retryIntervalsInSecs = serviceFunctionAnnotationContainer.getServiceFunctionNameToRetryIntervalsInSecsMap()[
          serviceFunctionName
        ];
        const interval = parser.parseExpression(cronSchedule);

        await findAsyncSequential([0, ...retryIntervalsInSecs], async (retryIntervalInSecs) => {
          await wait(retryIntervalInSecs * 1000);
          return getClsNamespace('multipleServiceFunctionExecutions').runAndReturn(async () => {
            return getClsNamespace('serviceFunctionExecution').runAndReturn(async () => {
              try {
                await dbManager.tryReserveDbConnectionFromPool();
                getClsNamespace('multipleServiceFunctionExecutions').set('connection', true);

                const [, error] = await dbManager.executeInsideTransaction(async () => {
                  getClsNamespace('multipleServiceFunctionExecutions').set('globalTransaction', true);

                  const [, error] = await dbManager.updateEntityByFilters(__Backk__CronJobScheduling, { serviceFunctionName }, {
                    lastScheduledTimestamp: new Date(),
                    nextScheduledTimestamp: interval.next().toDate()
                  }, {
                    entityPreHooks: {
                      shouldSucceedOrBeTrue: ({ nextScheduledTimestamp }) =>
                        Math.abs(Date.now() - nextScheduledTimestamp.valueOf()) < Values._500
                    }
                  });

                  if (error?.statusCode === HttpStatusCodes.BAD_REQUEST) {
                    return [null, null];
                  }

                  if (error) {
                    return [null, error];
                  }

                  const ServiceFunctionArgType = findServiceFunctionArgumentType(
                    controller,
                    serviceFunctionName
                  );

                  const serviceFunctionArgument = ServiceFunctionArgType ? new ServiceFunctionArgType() : {};
                  const response = new BackkResponse();

                  await tryExecuteServiceMethod(
                    controller,
                    serviceFunctionName,
                    serviceFunctionArgument,
                    {},
                    response,
                    undefined,
                    false
                  );

                  return [null, response.getErrorResponse()];
                });

                getClsNamespace('multipleServiceFunctionExecutions').set('globalTransaction', true);
                return !error;
              } catch (error) {
                logError(error);
                return false;
              } finally {
                dbManager.tryReleaseDbConnectionBackToPool();
                getClsNamespace('multipleServiceFunctionExecutions').set('connection', false);
              }
            });
          });
        });
      });

      cronJobs[serviceFunctionName] = job;
      job.start();
    }
  );
}
