import { ITopicConfig, Kafka, logLevel } from 'kafkajs';
import tryExecuteServiceMethod from '../../../execution/tryExecuteServiceMethod';
import tracerProvider from '../../../observability/distributedtracinig/tracerProvider';
import log, { Severity } from '../../../observability/logging/log';
import { CanonicalCode, Span } from '@opentelemetry/api';
import defaultServiceMetrics from '../../../observability/metrics/defaultServiceMetrics';
import forEachAsyncParallel from '../../../utils/forEachAsyncParallel';
import { HttpStatusCodes } from '../../../constants/constants';
import sendToRemoteService from '../sendToRemoteService';
import getNamespacedServiceName from '../../../utils/getServiceNamespace';
import BackkResponse from '../../../execution/BackkResponse';
import wait from '../../../utils/wait';
import minimumLoggingSeverityToKafkaLoggingLevelMap from './minimumLoggingSeverityToKafkaLoggingLevelMap';
import logCreator from './logCreator';

export default async function consumeFromKafka(
  controller: any,
  server: string | undefined,
  defaultTopic: string = getNamespacedServiceName(),
  defaultTopicConfig?: Omit<ITopicConfig, 'topic'>,
  additionalTopics?: string[]
) {
  if (!server) {
    throw new Error('Kafka server not defined');
  }

  const replicationFactor =
    process.env.NODE_ENV === 'development'
      ? 1
      : parseInt(process.env.KAFKA_DEFAULT_TOPIC_NUM_PARTITIONS ?? '3', 10);

  const numPartitions =
    process.env.NODE_ENV === 'development'
      ? 1
      : parseInt(process.env.KAFKA_DEFAULT_TOPIC_NUM_PARTITIONS ?? '3', 10);

  const finalDefaultTopicConfig = defaultTopicConfig ?? {
    replicationFactor,
    numPartitions,
    configEntries: [
      {
        name: 'retention.ms',
        value: process.env.KAFKA_DEFAULT_TOPIC_RETENTION_MS ?? (5 * 60 * 1000).toString()
      }
    ]
  };

  const kafkaClient = new Kafka({
    clientId: getNamespacedServiceName(),
    logLevel: minimumLoggingSeverityToKafkaLoggingLevelMap[process.env.LOG_LEVEL ?? 'INFO'],
    brokers: [server],
    logCreator
  });

  const consumer = kafkaClient.consumer({ groupId: getNamespacedServiceName() });
  let fetchSpan: Span | undefined;
  let hasFetchError = false;

  consumer.on(consumer.events.CRASH, ({ error, ...restOfEvent }) => {
    log(Severity.ERROR, 'Kafka consumer error: crashed due to errorMessageOnPreHookFuncExecFailure', error, restOfEvent);
    defaultServiceMetrics.incrementKafkaConsumerErrorsByOne();
    hasFetchError = true;
    fetchSpan?.setStatus({
      code: CanonicalCode.UNKNOWN,
      message: error
    });
  });

  consumer.on(consumer.events.REQUEST_TIMEOUT, (event) => {
    log(Severity.ERROR, 'Kafka consumer error: request to server has timed out', '', event);
    defaultServiceMetrics.incrementKafkaConsumerRequestTimeoutsByOne();
    hasFetchError = true;
    fetchSpan?.setStatus({
      code: CanonicalCode.UNKNOWN,
      message: 'Consumer request to server has timed out'
    });
  });

  consumer.on(consumer.events.FETCH_START, () => {
    log(Severity.DEBUG, 'Kafka consumer debug: started fetch messages from server', '');
    fetchSpan = tracerProvider.getTracer('default').startSpan('kafkajs.consumer.FETCH_START');
    hasFetchError = false;
    fetchSpan.setAttribute('component', 'kafkajs');
    fetchSpan.setAttribute('span.kind', 'CLIENT');
    fetchSpan.setAttribute('peer.address', server);
  });

  consumer.on(consumer.events.FETCH, (event) => {
    log(Severity.DEBUG, 'Kafka consumer debug: finished fetching messages from server', '', event);
    fetchSpan?.setAttribute('kafka.consumer.fetch.numberOfBatches', event.numberOfBatches);
    if (!hasFetchError) {
      fetchSpan?.setStatus({
        code: CanonicalCode.OK
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
              ...finalDefaultTopicConfig
            }
          ]
        });

        if (didCreateDefaultTopic) {
          log(Severity.INFO, 'Kafka admin client info: created default topic', '', {
            defaultTopic,
            ...finalDefaultTopicConfig
          });
        }
      }

      hasCreatedDefaultTopic = true;
    } catch (error) {
      log(Severity.ERROR, 'Kafka admin client error: ' + error.message, error.stack, {
        consumerType: 'kafka',
        server
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
            response
          );

          if (response.getStatusCode() >= HttpStatusCodes.INTERNAL_ERRORS_START) {
            await wait(10000);
            await sendToRemoteService(
              'kafka://' + server + '/' + defaultTopic + '/' + serviceFunctionName,
              serviceFunctionArgument
            );
          } else if (response.getStatusCode() >= HttpStatusCodes.CLIENT_ERRORS_START) {
            throw new Error(JSON.stringify(response.getResponse()));
          } else if (headers?.responseUrl && response) {
            await sendToRemoteService(headers.responseUrl as string, response);
          }
        }
      });

      hasStartedConsumer = true;
    } catch (error) {
      log(Severity.ERROR, 'Kafka consumer error: ' + error.message, error.stack, {
        consumerType: 'kafka',
        server,
        defaultTopic,
        additionalTopics: additionalTopics?.join(', ')
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
