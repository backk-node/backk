import { CompressionTypes, Kafka, Producer, Transaction } from 'kafkajs';
import { getNamespace } from 'cls-hooked';
import tracerProvider from '../../../observability/distributedtracinig/tracerProvider';
import forEachAsyncSequential from '../../../utils/forEachAsyncSequential';
import { CallOrSendToUrlSpec } from '../sendToRemoteServiceInsideTransaction';
import log, { Severity } from '../../../observability/logging/log';
import { CanonicalCode } from '@opentelemetry/api';
import createBackkErrorFromError from '../../../errors/createBackkErrorFromError';
import parseRemoteServiceFunctionCallUrlParts from '../../utils/parseRemoteServiceFunctionCallUrlParts';
import minimumLoggingSeverityToKafkaLoggingLevelMap from './minimumLoggingSeverityToKafkaLoggingLevelMap';
import logCreator from './logCreator';
import defaultServiceMetrics from '../../../observability/metrics/defaultServiceMetrics';
import getNamespacedMicroserviceName from '../../../utils/getNamespacedMicroserviceName';
import { PromiseErrorOr } from '../../../types/PromiseErrorOr';

export const kafkaServerToKafkaClientMap: { [key: string]: Kafka } = {};

export enum SendAcknowledgementType {
  NONE,
  LEADER_ONLY,
  ALL_REPLICAS = -1
}

export default async function sendOneOrMoreToKafka(
  sends: CallOrSendToUrlSpec[],
  isTransactional: boolean
): PromiseErrorOr<null> {
  const { server, topic } = parseRemoteServiceFunctionCallUrlParts(sends[0].serviceFunctionUrl);

  if (!kafkaServerToKafkaClientMap[server]) {
    kafkaServerToKafkaClientMap[server] = new Kafka({
      clientId: getNamespacedMicroserviceName(),
      logLevel: minimumLoggingSeverityToKafkaLoggingLevelMap[process.env.LOG_LEVEL ?? 'INFO'],
      brokers: [server],
      logCreator
    });
  }

  const authHeader = getNamespace('serviceFunctionExecution')?.get('authHeader');
  const kafkaClient = kafkaServerToKafkaClientMap[server];
  const producer = kafkaClient.producer(isTransactional ? { maxInFlightRequests: 1, idempotent: true } : {});
  let transaction;
  const producerConnectSpan = tracerProvider.getTracer('default').startSpan('kafkajs.producer.connect');
  let transactionSpan;

  try {
    producerConnectSpan.setAttribute('component', 'kafkajs');
    producerConnectSpan.setAttribute('span.kind', 'CLIENT');
    producerConnectSpan.setAttribute('peer.address', server);
    await producer.connect();

    let producerOrTransaction: Producer | Transaction;
    if (isTransactional) {
      transaction = await producer.transaction();
      producerOrTransaction = transaction;
      transactionSpan = tracerProvider.getTracer('default').startSpan('kafkajs.producer.transaction');
      transactionSpan.setAttribute('component', 'kafkajs');
      transactionSpan.setAttribute('span.kind', 'CLIENT');
      transactionSpan.setAttribute('peer.address', server);
    } else {
      producerOrTransaction = producer;
    }

    await forEachAsyncSequential(
      sends,
      async ({
        sendResponseTo,
        serviceFunctionUrl,
        options,
        serviceFunctionArgument
      }: CallOrSendToUrlSpec) => {
        const { serviceFunctionName } = parseRemoteServiceFunctionCallUrlParts(serviceFunctionUrl);
        log(Severity.DEBUG, 'Kafka producer debug: produce message', '', {
          serviceFunctionUrl: serviceFunctionUrl,
          serviceFunctionName
        });

        const span = tracerProvider
          .getTracer('default')
          .startSpan(isTransactional ? 'kafkajs.transaction.send' : 'kafkajs.producer.send');

        span.setAttribute('component', 'kafkajs');
        span.setAttribute('span.kind', 'CLIENT');
        span.setAttribute('peer.address', server);
        span.setAttribute('kafka.topic', topic);
        span.setAttribute('kafka.producer.message.key', serviceFunctionName);

        defaultServiceMetrics.incrementRemoteServiceCallCountByOne(serviceFunctionUrl);

        try {
          await producerOrTransaction.send({
            topic,
            compression: options?.compressionType ?? CompressionTypes.None,
            acks: isTransactional
              ? SendAcknowledgementType.ALL_REPLICAS
              : options?.sendAcknowledgementType ?? SendAcknowledgementType.ALL_REPLICAS,
            messages: [
              {
                key: serviceFunctionName,
                value: JSON.stringify(serviceFunctionArgument),
                headers: {
                  ...(authHeader ? { Authorization: authHeader } : {}),
                  ...(sendResponseTo ? { sendResponseTo: JSON.stringify(sendResponseTo) } : {})
                }
              }
            ]
          });

          span.setStatus({
            code: CanonicalCode.OK
          });
        } catch (error) {
          log(Severity.ERROR, 'Kafka producer error: ' + error.message, error.stack, {
            serviceFunctionCallUrl: serviceFunctionUrl,
            serviceFunction: serviceFunctionName
          });

          defaultServiceMetrics.incrementRemoteServiceCallErrorCountByOne(serviceFunctionUrl);
          span.setStatus({
            code: CanonicalCode.UNKNOWN,
            message: error.message
          });

          throw error;
        } finally {
          span.end();
        }
      }
    );

    await transaction?.commit();

    transactionSpan?.setStatus({
      code: CanonicalCode.OK
    });

    producerConnectSpan?.setStatus({
      code: CanonicalCode.OK
    });

    return [null, null];
  } catch (error) {
    await transaction?.abort();

    transactionSpan?.setStatus({
      code: CanonicalCode.UNKNOWN,
      message: error.message
    });

    producerConnectSpan?.setStatus({
      code: CanonicalCode.UNKNOWN,
      message: error.message
    });

    return [null, createBackkErrorFromError(error)];
  } finally {
    try {
      await producer.disconnect();
    } catch (error) {
      // NOOP
    }
    transactionSpan?.end();
    producerConnectSpan.end();
  }
}
