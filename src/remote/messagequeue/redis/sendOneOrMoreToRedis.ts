import Redis from "ioredis";
import { CallOrSendTo } from "../sendToRemoteServiceInsideTransaction";
import parseRemoteServiceFunctionCallUrlParts from "../../utils/parseRemoteServiceFunctionCallUrlParts";
import { getNamespace } from "cls-hooked";
import forEachAsyncSequential from "../../../utils/forEachAsyncSequential";
import log, { Severity } from "../../../observability/logging/log";
import createBackkErrorFromError from "../../../errors/createBackkErrorFromError";
import defaultServiceMetrics from "../../../observability/metrics/defaultServiceMetrics";
import { PromiseErrorOr } from "../../../types/PromiseErrorOr";

export default async function sendOneOrMoreToRedis(
  sends: CallOrSendTo[],
  isTransactional: boolean
): PromiseErrorOr<null> {
  const remoteServiceUrl = sends[0].remoteServiceFunctionUrl;
  const { server, topic } = parseRemoteServiceFunctionCallUrlParts(remoteServiceUrl);
  const redis = new Redis(server);
  const authHeader = getNamespace('serviceFunctionExecution')?.get('authHeader');

  try {
    if (isTransactional) {
      redis.multi();
    }

    await forEachAsyncSequential(
      sends,
      async ({ responseUrl, remoteServiceFunctionUrl, serviceFunctionArgument }: CallOrSendTo) => {
        const { serviceFunctionName } = parseRemoteServiceFunctionCallUrlParts(remoteServiceFunctionUrl);
        log(Severity.DEBUG, 'CallOrSendTo to remote service for execution', '', {
          serviceFunctionCallUrl: remoteServiceFunctionUrl,
          serviceFunction: serviceFunctionName
        });

        defaultServiceMetrics.incrementRemoteServiceCallCountByOne(remoteServiceFunctionUrl);
        await redis.rpush(
          topic,
          JSON.stringify({
            serviceFunctionName,
            serviceFunctionArgument,
            headers: {
              Authorization: authHeader,
              responseUrl
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
