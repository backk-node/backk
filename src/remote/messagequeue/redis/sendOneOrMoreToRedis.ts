import Redis from "ioredis";
import { CallOrSendToUrlSpec } from "../sendToRemoteServiceInsideTransaction";
import parseRemoteServiceFunctionCallUrlParts from "../../utils/parseRemoteServiceFunctionCallUrlParts";
import { getNamespace } from "cls-hooked";
import forEachAsyncSequential from "../../../utils/forEachAsyncSequential";
import log, { Severity } from "../../../observability/logging/log";
import createBackkErrorFromError from "../../../errors/createBackkErrorFromError";
import defaultServiceMetrics from "../../../observability/metrics/defaultServiceMetrics";
import { PromiseErrorOr } from "../../../types/PromiseErrorOr";

export default async function sendOneOrMoreToRedis(
  sends: CallOrSendToUrlSpec[],
  isTransactional: boolean
): PromiseErrorOr<null> {
  const remoteServiceUrl = sends[0].serviceFunctionUrl;
  const { server, topic } = parseRemoteServiceFunctionCallUrlParts(remoteServiceUrl);
  const password = process.env.REDIS_CACHE_PASSWORD ? `:${process.env.REDIS_CACHE_PASSWORD}@` : '';
  const redis = new Redis(`redis://${password}${server}`);
  const authHeader = getNamespace('serviceFunctionExecution')?.get('authHeader');

  try {
    if (isTransactional) {
      redis.multi();
    }

    await forEachAsyncSequential(
      sends,
      async ({ sendResponseTo, serviceFunctionUrl, serviceFunctionArgument }: CallOrSendToUrlSpec) => {
        const { serviceFunctionName } = parseRemoteServiceFunctionCallUrlParts(serviceFunctionUrl);
        log(Severity.DEBUG, 'CallOrSendToSpec to remote service for execution', '', {
          serviceFunctionCallUrl: serviceFunctionUrl,
          serviceFunction: serviceFunctionName
        });

        defaultServiceMetrics.incrementRemoteServiceCallCountByOne(serviceFunctionUrl);
        await redis.rpush(
          topic,
          JSON.stringify({
            serviceFunctionName,
            serviceFunctionArgument: serviceFunctionArgument,
            headers: {
              Authorization: authHeader,
              sendResponseTo
            }
          })
        );
      }
    );

    if (isTransactional) {
      await redis.exec();
    }

    return [null, null];
  } catch (error) {
    defaultServiceMetrics.incrementRemoteServiceCallErrorCountByOne(remoteServiceUrl);
    return [null, createBackkErrorFromError(error)];
  }
}
