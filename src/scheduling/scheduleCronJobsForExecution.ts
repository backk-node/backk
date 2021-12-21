import { CronJob } from 'cron';
import parser from 'cron-parser';
import { DataStore } from '../datastore/DataStore';
import serviceFunctionAnnotationContainer from '../decorators/service/function/serviceFunctionAnnotationContainer';
// eslint-disable-next-line @typescript-eslint/camelcase
import __Backk__CronJobScheduling from './entities/__Backk__CronJobScheduling';
import findAsyncSequential from '../utils/findAsyncSequential';
import wait from '../utils/wait';
import { logError } from '../observability/logging/log';
import tryExecuteServiceMethod from '../execution/tryExecuteServiceMethod';
import findServiceFunctionArgumentType from '../metadata/findServiceFunctionArgumentType';
import BackkResponse from '../execution/BackkResponse';
import { HttpStatusCodes, Values } from '../constants/constants';
import getClsNamespace from '../continuationlocalstorage/getClsNamespace';

const cronJobs: { [key: string]: CronJob } = {};

export default function scheduleCronJobsForExecution(microservice: any, dataStore: DataStore) {
  if (process.env.NODE_ENV !== 'production') {
    return;
  }

  Object.entries(serviceFunctionAnnotationContainer.getServiceFunctionNameToCronScheduleMap()).forEach(
    ([serviceClassNameAndFunctionName, cronSchedule]) => {
      const [serviceName] = Object.entries(microservice).find(([, service]: [string, any]) =>
        service.constructor.name === serviceClassNameAndFunctionName.split('.')[0]) ?? ['', null];
      const serviceFunctionName = serviceName + '.' + serviceClassNameAndFunctionName.split('.').pop();
      const job = new CronJob(cronSchedule, async () => {
        const retryIntervalsInSecs = serviceFunctionAnnotationContainer.getServiceFunctionNameToRetryIntervalsInSecsMap()[
          serviceClassNameAndFunctionName
        ];
        const interval = parser.parseExpression(cronSchedule);

        await findAsyncSequential([0, ...retryIntervalsInSecs], async (retryIntervalInSecs) => {
          await wait(retryIntervalInSecs * 1000);
          return getClsNamespace('multipleServiceFunctionExecutions').runAndReturn(async () => {
            return getClsNamespace('serviceFunctionExecution').runAndReturn(async () => {
              try {
                await dataStore.tryReserveDbConnectionFromPool();
                getClsNamespace('multipleServiceFunctionExecutions').set('connection', true);

                const [, error] = await dataStore.executeInsideTransaction(async () => {
                  getClsNamespace('multipleServiceFunctionExecutions').set('globalTransaction', true);

                  const [, error] = await dataStore.updateEntityByFilters(
                    __Backk__CronJobScheduling,
                    { serviceFunctionName },
                    {
                      lastScheduledTimestamp: new Date(),
                      nextScheduledTimestamp: interval.next().toDate()
                    },
                    {
                      entityPreHooks: {
                        shouldSucceedOrBeTrue: ({ nextScheduledTimestamp }) =>
                          Math.abs(Date.now() - nextScheduledTimestamp.valueOf()) < Values._500
                      }
                    }
                  );

                  if (error?.statusCode === HttpStatusCodes.BAD_REQUEST) {
                    return [null, null];
                  }

                  if (error) {
                    return [null, error];
                  }

                  const ServiceFunctionArgType = findServiceFunctionArgumentType(
                    microservice,
                    serviceFunctionName
                  );

                  const serviceFunctionArgument = ServiceFunctionArgType ? new ServiceFunctionArgType() : {};
                  const response = new BackkResponse();

                  await tryExecuteServiceMethod(
                    microservice,
                    serviceFunctionName,
                    serviceFunctionArgument,
                    {},
                    'POST',
                    response,
                    true,
                    undefined
                  );

                  return [null, response.getErrorResponse()];
                });

                getClsNamespace('multipleServiceFunctionExecutions').set('globalTransaction', true);
                return !error;
              } catch (error) {
                logError(error);
                return false;
              } finally {
                getClsNamespace('multipleServiceFunctionExecutions').set('connection', false);
                dataStore.tryReleaseDbConnectionBackToPool();
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
