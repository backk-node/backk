import BaseService from "../service/BaseService";
// eslint-disable-next-line @typescript-eslint/camelcase
import __Backk__JobScheduling from "./entities/__Backk__JobScheduling";
import { BackkError } from "../types/BackkError";
import { validateOrReject } from "class-validator";
import getValidationErrors from "../validation/getValidationErrors";
import createErrorFromErrorMessageAndThrowError from "../errors/createErrorFromErrorMessageAndThrowError";
import createErrorMessageWithStatusCode from "../errors/createErrorMessageWithStatusCode";
import { HttpStatusCodes } from "../constants/constants";
import { plainToClass } from "class-transformer";
import JobScheduling from "./entities/JobScheduling";
import { scheduleCronJob } from "./scheduleCronJob";
import createErrorFromErrorCodeMessageAndStatus from "../errors/createErrorFromErrorCodeMessageAndStatus";
import { BACKK_ERRORS } from "../errors/backkErrors";
import emptyError from "../errors/emptyError";
import getClsNamespace from "../continuationlocalstorage/getClsNamespace";
import { One } from "../datastore/AbstractDataStore";

export default async function tryScheduleJobExecution(
  controller: any,
  scheduledExecutionArgument: any,
  headers: { [key: string]: string | string[] | undefined },
  resp?: any
) {
  const instantiatedScheduledExecutionArgument = plainToClass(JobScheduling, scheduledExecutionArgument);

  try {
    await validateOrReject(instantiatedScheduledExecutionArgument, {
      whitelist: true,
      forbidNonWhitelisted: true
    });
  } catch (validationErrors) {
    const errorMessage =
      `Error code ${BACKK_ERRORS.INVALID_ARGUMENT.errorCode}:${BACKK_ERRORS.INVALID_ARGUMENT.message}:` +
      getValidationErrors(validationErrors);
    createErrorFromErrorMessageAndThrowError(
      createErrorMessageWithStatusCode(errorMessage, HttpStatusCodes.BAD_REQUEST)
    );
  }

  const {
    serviceFunctionName,
    scheduledExecutionTimestamp,
    serviceFunctionArgument,
    retryIntervalsInSecs
  }: {
    serviceFunctionName: string;
    scheduledExecutionTimestamp: string;
    serviceFunctionArgument: any;
    retryIntervalsInSecs: number[];
  } = scheduledExecutionArgument;

  const [serviceName, functionName] = serviceFunctionName.split('.');

  if (!controller[serviceName]) {
    throw createErrorFromErrorCodeMessageAndStatus({
      ...BACKK_ERRORS.UNKNOWN_SERVICE,
      message: BACKK_ERRORS.UNKNOWN_SERVICE.message + serviceName
    });
  }

  const serviceFunctionResponseValueTypeName =
    controller[`${serviceName}__BackkTypes__`].functionNameToReturnTypeNameMap[functionName];

  if (!controller[serviceName][functionName] || !serviceFunctionResponseValueTypeName) {
    throw createErrorFromErrorCodeMessageAndStatus({
      ...BACKK_ERRORS.UNKNOWN_SERVICE_FUNCTION,
      message: BACKK_ERRORS.UNKNOWN_SERVICE_FUNCTION.message + serviceFunctionName
    });
  }

  const retryIntervalsInSecsStr = retryIntervalsInSecs.join(',');
  const serviceFunctionArgumentStr = serviceFunctionArgument ? JSON.stringify(serviceFunctionArgument) : '';
  const scheduledExecutionTimestampAsDate = new Date(Date.parse(scheduledExecutionTimestamp));
  // TODO check that seconds are zero, because 1 min granularity only allowed
  const dataStore = (controller[serviceName] as BaseService).getDataStore();
  // eslint-disable-next-line @typescript-eslint/camelcase
  let entity: One<__Backk__JobScheduling> | null | undefined;
  let error: BackkError | null | undefined = emptyError;
  const clsNamespace = getClsNamespace('serviceFunctionExecution');

  await clsNamespace.runAndReturn(async () => {
    await dataStore.tryReserveDbConnectionFromPool();

    [entity, error] = await dataStore.createEntity(__Backk__JobScheduling, {
      serviceFunctionName,
      retryIntervalsInSecs: retryIntervalsInSecsStr,
      scheduledExecutionTimestamp: scheduledExecutionTimestampAsDate,
      serviceFunctionArgument: serviceFunctionArgumentStr
    });

    dataStore.tryReleaseDbConnectionBackToPool();
  });

  if (!entity) {
    throw error;
  }

  const jobId = entity?.data._id;

  await scheduleCronJob(
    scheduledExecutionTimestampAsDate,
    retryIntervalsInSecs,
    dataStore,
    jobId,
    controller,
    serviceFunctionName,
    { ...serviceFunctionArgument, jobId }
  );

  resp?.send({
    jobId
  });
}
