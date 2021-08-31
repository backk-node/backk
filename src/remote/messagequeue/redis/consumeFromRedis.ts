/* eslint-disable no-constant-condition */
import Redis from 'ioredis';
import tryExecuteServiceMethod from '../../../execution/tryExecuteServiceMethod';
import { HttpStatusCodes } from '../../../constants/constants';
import sendToRemoteService from '../sendToRemoteService';
import log, { Severity } from '../../../observability/logging/log';
import defaultServiceMetrics from '../../../observability/metrics/defaultServiceMetrics';
import getNamespacedServiceName from '../../../utils/getServiceNamespace';
import BackkResponse from '../../../execution/BackkResponse';
import wait from '../../../utils/wait';

export default async function consumeFromRedis(
  controller: any,
  server: string | undefined,
  topic = getNamespacedServiceName()
) {
  if (!server) {
    throw new Error(
      'Redis server not defined. Redis server must be defined in REDIS_SERVER environment variable in the form <host>:<port>'
    );
  }

  const redis = new Redis(`redis://${server}`);
  let lastQueueLengthUpdateTimestamp = 0;

  function exit(signal: string) {
    redis.quit();
    log(Severity.INFO, `Redis consumer terminated due to signal: ${signal}`, '');
    process.exitCode = 0;
  }

  process.once('SIGINT', exit);
  process.once('SIGQUIT', exit);
  process.once('SIGTERM', exit);

  process.on('uncaughtExceptionMonitor', () => {
    try {
      redis.quit();
    } catch {
      // No operation
    }
  });

  // noinspection InfiniteLoopJS
  while (true) {
    try {
      const request = await redis.lpop(topic);
      if (!request) {
        await wait(100);
        // noinspection ContinueStatementJS
        continue;
      }

      log(Severity.DEBUG, 'Redis: consume request from queue', '', { broker: server, topic });
      const { serviceFunctionName, serviceFunctionArgument, headers } = JSON.parse(request);

      const response = new BackkResponse();
      await tryExecuteServiceMethod(
        controller,
        serviceFunctionName,
        serviceFunctionArgument,
        headers ?? {},
        'POST',
        response
      );

      if (response.getStatusCode() >= HttpStatusCodes.INTERNAL_ERRORS_START) {
        await wait(10000);
        await sendToRemoteService(
          'redis://' + server + '/' + topic + '/' + serviceFunctionName,
          serviceFunctionArgument
        );
      } else if (response.getStatusCode() >= HttpStatusCodes.CLIENT_ERRORS_START) {
        throw new Error(JSON.stringify(response.getResponse()));
      } else if (headers?.responseUrl && response.getResponse()) {
        await sendToRemoteService(headers.responseUrl as string, response);
      }

      const now = Date.now();
      if (now - lastQueueLengthUpdateTimestamp >= 5000) {
        const queueLength = await redis.llen(topic);
        defaultServiceMetrics.recordRedisConsumerQueueLength(queueLength);
        lastQueueLengthUpdateTimestamp = now;
      }
    } catch (error) {
      log(Severity.ERROR, 'Redis consumer error: ' + error.message, error.stack, {
        consumerType: 'redis',
        server,
        topic
      });
      defaultServiceMetrics.incrementRedisConsumerErrorCountByOne();
    }
  }
}
