import { CanonicalCode, Span } from '@opentelemetry/api';
import { ITopicConfig, Kafka } from 'kafkajs';
import { HttpStatusCodes } from '../../../constants/constants';
import BackkResponse from '../../../execution/BackkResponse';
import tryExecuteServiceMethod from '../../../execution/tryExecuteServiceMethod';
import tracerProvider from '../../../observability/distributedtracinig/tracerProvider';
import log, { Severity } from '../../../observability/logging/log';
import defaultServiceMetrics from '../../../observability/metrics/defaultServiceMetrics';
import forEachAsyncParallel from '../../../utils/forEachAsyncParallel';
import getNamespacedMicroserviceName from '../../../utils/getNamespacedMicroserviceName';
import wait from '../../../utils/wait';
import callRemoteService from '../../http/callRemoteService';
import sendToRemoteService from '../sendToRemoteService';
import { ResponseDestination } from '../sendToRemoteServiceInsideTransaction';
import logCreator from './logCreator';
import minimumLoggingSeverityToKafkaLoggingLevelMap from './minimumLoggingSeverityToKafkaLoggingLevelMap';

export default async function consumeFromKafka(
  controller: any,
  host: string | undefined,
  port: string | undefined,
  defaultTopic: string = getNamespacedMicroserviceName(),
  defaultTopicConfig?: Omit<ITopicConfig, 'topic' | 'numPartitions' | 'replicationFactor'>,
  additionalTopics?: string[]
) {
  if (!host) {
    throw new Error('KAFKA_HOST environment value must be defined');
  }

  if (!port) {
    throw new Error('KAFKA_PORT environment value must be defined');
  }

  const server = `${host}:${port}`;

  const replicationFactor =
    process.env.NODE_ENV === 'development'
      ? 1
      : parseInt(process.env.KAFKA_DEFAULT_TOPIC_REPLICATION_FACTOR ?? '3', 10);

  const numPartitions =
    process.env.NODE_ENV === 'development'
      ? 1
      : parseInt(process.env.KAFKA_DEFAULT_TOPIC_NUM_PARTITIONS ?? '3', 10);

  const hasRetentionMsConfigEntry = defaultTopicConfig?.configEntries?.find(
    (configEntry: any) => configEntry.name === 'retention.ms'
  );
  const finalDefaultTopicConfig = {
    replicationFactor,
    numPartitions,
    configEntries: [
      ...(hasRetentionMsConfigEntry ? [] : [
        {
          name: 'retention.ms',
          value: process.env.KAFKA_DEFAULT_TOPIC_RETENTION_MS ?? (30 * 60 * 1000).toString(),
        },
      ]),
      ...(defaultTopicConfig?.configEntries ?? []),
    ],
    ...defaultTopicConfig,
  };

  const kafkaClient = new Kafka({
    clientId: getNamespacedMicroserviceName(),
    logLevel: minimumLoggingSeverityToKafkaLoggingLevelMap[process.env.LOG_LEVEL ?? 'INFO'],
    brokers: [server],
    logCreator,
  });

  const consumer = kafkaClient.consumer({ groupId: getNamespacedMicroserviceName() });
  let fetchSpan: Span | undefined;
  let hasFetchError = false;

  function exit(signal: string) {
    try {
      consumer.disconnect();
    } catch {
      // No operation
    }

    log(Severity.INFO, `Kafka consumer terminated due to signal: ${signal}`, '');
    process.exitCode = 0;
  }

  process.once('SIGINT', exit);
  process.once('SIGQUIT', exit);
  process.once('SIGTERM', exit);

  process.on('uncaughtExceptionMonitor', () => {
    try {
      consumer.disconnect();
    } catch {
      // No operation
    }
  });

  consumer.on(consumer.events.CRASH, ({ error, ...restOfEvent }) => {
    log(Severity.ERROR, 'Kafka consumer error: crashed due to error: ', error, restOfEvent);
    defaultServiceMetrics.incrementKafkaConsumerErrorsByOne();
    hasFetchError = true;
    fetchSpan?.setStatus({
      code: CanonicalCode.UNKNOWN,
      message: error,
    });
  });

  consumer.on(consumer.events.REQUEST_TIMEOUT, (event) => {
    log(Severity.ERROR, 'Kafka consumer error: request to server has timed out', '', event);
    defaultServiceMetrics.incrementKafkaConsumerRequestTimeoutsByOne();
    hasFetchError = true;
    fetchSpan?.setStatus({
      code: CanonicalCode.UNKNOWN,
      message: 'Consumer request to server has timed out',
    });
  });

  consumer.on(consumer.events.FETCH_START, () => {
    log(Severity.DEBUG, 'Kafka consumer debug: started fetch messages from server', '');
    fetchSpan = tracerProvider.getTracer('default').startSpan('kafkajs.consumer.FETCH_START');
    hasFetchError = false;
    fetchSpan?.setAttribute('component', 'kafkajs');
    fetchSpan?.setAttribute('span.kind', 'CLIENT');
    fetchSpan?.setAttribute('peer.address', server);
  });

  consumer.on(consumer.events.FETCH, (event) => {
    log(Severity.DEBUG, 'Kafka consumer debug: finished fetching messages from server', '', event);
    fetchSpan?.setAttribute('kafka.consumer.fetch.numberOfBatches', event.numberOfBatches);
    if (!hasFetchError) {
      fetchSpan?.setStatus({
        code: CanonicalCode.OK,
      });
    }
    fetchSpan?.end();
    fetchSpan = undefined;
  });

  consumer.on(consumer.events.START_BATCH_PROCESS, (event) => {
    log(Severity.DEBUG, 'Kafka consumer debug: started processing batch of messages', '', event);
  });

  consumer.on(consumer.events.END_BATCH_PROCESS, (event) => {
    log(Severity.DEBUG, 'Kafka consumer debug: finished processing batch of messages', '', event);
    defaultServiceMetrics.recordKafkaConsumerOffsetLag(event.partition, event.offsetLag);
  });

  consumer.on(consumer.events.COMMIT_OFFSETS, (event) => {
    log(Severity.DEBUG, 'Kafka consumer debug: committed offsets', '', event);
  });

  const admin = kafkaClient.admin();

  let hasCreatedDefaultTopic = false;
  while (!hasCreatedDefaultTopic) {
    try {
      await admin.connect();
      const existingTopics = await admin.listTopics();

      if (!existingTopics.includes(defaultTopic)) {
        const didCreateDefaultTopic = await admin.createTopics({
          topics: [
            {
              topic: defaultTopic,
              ...finalDefaultTopicConfig,
            },
          ],
        });

        if (didCreateDefaultTopic) {
          log(Severity.INFO, 'Kafka admin client info: created default topic', '', {
            defaultTopic,
            ...finalDefaultTopicConfig,
          });
        }
      }

      hasCreatedDefaultTopic = true;
    } catch (error) {
      log(Severity.ERROR, 'Kafka admin client error: ' + error.message, error.stack, {
        consumerType: 'kafka',
        server,
      });

      await wait(10000);
    } finally {
      try {
        await admin.disconnect();
      } catch (error) {
        // No operation
      }
    }
  }

  let hasStartedConsumer = false;
  while (!hasStartedConsumer) {
    try {
      await consumer.connect();
      await consumer.subscribe({ topic: defaultTopic });
      await forEachAsyncParallel(
        additionalTopics ?? [],
        async (topic) => await consumer.subscribe({ topic })
      );

      await consumer.run({
        eachMessage: async ({ message: { key, value, headers } }) => {
          const serviceFunctionName = key.toString();
          const valueStr = value?.toString();
          const serviceFunctionArgument = valueStr ? JSON.parse(valueStr) : null;

          const response = new BackkResponse();
          await tryExecuteServiceMethod(
            controller,
            serviceFunctionName,
            serviceFunctionArgument,
            (headers as any) ?? {},
            'POST',
            response,
            true
          );

          if (response.getStatusCode() >= HttpStatusCodes.INTERNAL_ERRORS_START) {
            await wait(10000);
            await sendToRemoteService(
              'kafka',
              defaultTopic.split('.')[0],
              serviceFunctionName,
              serviceFunctionArgument,
              defaultTopic.split('.')[1],
              server
            );
          } else if (response.getStatusCode() >= HttpStatusCodes.CLIENT_ERRORS_START) {
            throw new Error(JSON.stringify(response.getResponse()));
          } else if (headers?.sendResponseTo && response) {
            const {
              communicationMethod,
              microserviceName,
              serviceFunctionName,
              microserviceNamespace,
              server,
            } = headers?.sendResponseTo as unknown as ResponseDestination;

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
        },
      });

      hasStartedConsumer = true;
    } catch (error) {
      log(Severity.ERROR, 'Kafka consumer error: ' + error.message, error.stack, {
        consumerType: 'kafka',
        server,
        defaultTopic,
        additionalTopics: additionalTopics?.join(', '),
      });

      defaultServiceMetrics.incrementKafkaConsumerErrorsByOne();

      try {
        await consumer.disconnect();
      } catch {
        // No operation
      }

      await wait(10000);
    }
  }
}
