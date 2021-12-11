/* eslint-disable no-constant-condition */
import Redis from 'ioredis';
import tryExecuteServiceMethod from '../../../execution/tryExecuteServiceMethod';
import { HttpStatusCodes } from '../../../constants/constants';
import sendToRemoteService from '../sendToRemoteService';
import log, { Severity } from '../../../observability/logging/log';
import defaultServiceMetrics from '../../../observability/metrics/defaultServiceMetrics';
import getNamespacedMicroserviceName from '../../../utils/getNamespacedMicroserviceName';
import BackkResponse from '../../../execution/BackkResponse';
import wait from '../../../utils/wait';
import { ResponseDestination } from '../sendToRemoteServiceInsideTransaction';
import callRemoteService from '../../http/callRemoteService';

export default async function consumeFromRedis(
  controller: any,
  host: string | undefined,
  port: string | undefined,
  topic = getNamespacedMicroserviceName()
) {
  if (!host) {
    throw new Error('REDIS_HOST environment variable must be defined');
  }

  if (!port) {
    throw new Error('REDIS_PORT environment variable must be defined');
  }

  const server = `${host}:${port}`;

  const password = process.env.REDIS_CACHE_PASSWORD ? `:${process.env.REDIS_CACHE_PASSWORD}@` : '';
  const redis = new Redis(`redis://${password}${server}`);
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
        response,
        true
      );

      if (response.getStatusCode() >= HttpStatusCodes.INTERNAL_ERRORS_START) {
        await wait(10000);
        await sendToRemoteService(
          'redis',
          topic.split('.')[0],
          serviceFunctionName,
          serviceFunctionArgument,
          topic.split('.')[0],
          server
        );
      } else if (response.getStatusCode() >= HttpStatusCodes.CLIENT_ERRORS_START) {
        throw new Error(JSON.stringify(response.getResponse()));
      } else if (headers?.sendResponseTo && response.getResponse()) {
        const {
          communicationMethod,
          microserviceName,
          serviceFunctionName,
          microserviceNamespace,
          server
        } = headers?.sendResponseTo as ResponseDestination;

        if (communicationMethod === 'kafka' || communicationMethod === 'redis') {
          await sendToRemoteService(
            communicationMethod,
            microserviceName,
            serviceFunctionName,
            response,
            microserviceNamespace,
            server
          );
        } else {
          callRemoteService(microserviceName, serviceFunctionName, response, microserviceNamespace);
        }
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
