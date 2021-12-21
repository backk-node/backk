import { ITopicConfig } from 'kafkajs';
import consumeFromKafka from '../remote/messagequeue/kafka/consumeFromKafka';
import getNamespacedMicroserviceName from '../utils/getNamespacedMicroserviceName';
import AbstractAsyncRequestProcessor from './AbstractAsyncRequestProcessor';
import { CommunicationMethod } from "../remote/messagequeue/sendToRemoteService";
import log, { Severity } from "../observability/logging/log";

export default class KafkaConsumer extends AbstractAsyncRequestProcessor {
  constructor(
    private readonly defaultTopicConfig?: Omit<ITopicConfig, 'topic' | 'numPartitions' | 'replicationFactor'>,
    private readonly additionalTopics?: string[]
  ) {
    super();
  }

  startProcessingRequests(): void {
    consumeFromKafka(
      this,
      process.env.KAFKA_HOST,
      process.env.KAFKA_PORT,
      getNamespacedMicroserviceName(),
      this.defaultTopicConfig,
      this.additionalTopics
    );
    log(Severity.INFO, `Kafka consumer started for Kafka server: ${process.env.KAFKA_HOST}:${process.env.KAFKA_PORT}`, '');
  }

  getCommunicationMethod(): CommunicationMethod {
    return 'kafka';
  }
}
