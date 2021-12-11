import { PromiseErrorOr } from "../../types/PromiseErrorOr";
import { CompressionTypes, Kafka } from "kafkajs";
import getNamespacedMicroserviceName from "../../utils/getNamespacedMicroserviceName";
import minimumLoggingSeverityToKafkaLoggingLevelMap
  from "./kafka/minimumLoggingSeverityToKafkaLoggingLevelMap";
import logCreator from "./kafka/logCreator";
import { getNamespace } from "cls-hooked";
import tracerProvider from "../../observability/distributedtracinig/tracerProvider";
import log, { Severity } from "../../observability/logging/log";
import { CanonicalCode } from "@opentelemetry/api";
import createBackkErrorFromError from "../../errors/createBackkErrorFromError";
import { kafkaServerToKafkaClientMap, SendAcknowledgementType } from "./kafka/sendOneOrMoreToKafka";
import getKafkaServerFromEnv from "./kafka/getKafkaServerFromEnv";
import { SendOptions } from "./sendToRemoteService";

export default async function sendToKafka(
  topic: string,
  messageKey: string | undefined,
  messageValue: any,
  server?: string,
  options?: SendOptions
): PromiseErrorOr<null> {
  const finalServer = server ?? getKafkaServerFromEnv();

  if (!kafkaServerToKafkaClientMap[finalServer]) {
    kafkaServerToKafkaClientMap[finalServer] = new Kafka({
      clientId: getNamespacedMicroserviceName(),
      logLevel: minimumLoggingSeverityToKafkaLoggingLevelMap[process.env.LOG_LEVEL ?? 'INFO'],
      brokers: [finalServer],
      logCreator
    });
  }

  const authHeader = getNamespace('serviceFunctionExecution')?.get('authHeader');
  const kafkaClient = kafkaServerToKafkaClientMap[finalServer];
  const producer = kafkaClient.producer();
  const producerConnectSpan = tracerProvider.getTracer('default').startSpan('kafkajs.producer.connect');

  try {
    producerConnectSpan.setAttribute('component', 'kafkajs');
    producerConnectSpan.setAttribute('span.kind', 'CLIENT');
    producerConnectSpan.setAttribute('peer.address', finalServer);
    await producer.connect();

    log(Severity.DEBUG, 'Kafka producer debug: produce message', '', {
      topic
    });

    const span = tracerProvider.getTracer('default').startSpan('kafkajs.producer.send');

    span.setAttribute('component', 'kafkajs');
    span.setAttribute('span.kind', 'CLIENT');
    span.setAttribute('peer.address', server);
    span.setAttribute('kafka.topic', topic);
    span.setAttribute('kafka.producer.message.key', messageKey);

    try {
      await producer.send({
        topic,
        compression: options?.compressionType ?? CompressionTypes.None,
        acks: options?.sendAcknowledgementType ?? SendAcknowledgementType.ALL_REPLICAS,
        messages: [
          {
            key: messageKey,
            value: messageValue,
            headers: {
              ...(authHeader ? { Authorization: authHeader } : {})
            }
          }
        ]
      });

      span.setStatus({
        code: CanonicalCode.OK
      });
    } catch (error) {
      log(Severity.ERROR, 'Kafka producer error: ' + error.message, error.stack, {
        topic
      });

      throw error;
    } finally {
      span.end();
    }

    producerConnectSpan?.setStatus({
      code: CanonicalCode.OK
    });

    return [null, null];
  } catch (error) {
    producerConnectSpan?.setStatus({
      code: CanonicalCode.UNKNOWN,
      message: error.message
    });

    return [null, createBackkErrorFromError(error)];
  } finally {
    try {
      await producer.disconnect();
    } catch (error) {
      // No operation
    }

    producerConnectSpan.end();
  }
}
