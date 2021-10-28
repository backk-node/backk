import { RequestProcessor } from './RequestProcessor';
import { ITopicConfig } from 'kafkajs';
import consumeFromKafka from "../remote/messagequeue/kafka/consumeFromKafka";
import getNamespacedMicroserviceName from "../utils/getNamespacedMicroserviceName";

export default class KafkaConsumer implements RequestProcessor {
  constructor(
    private readonly defaultTopicConfig?: Omit<ITopicConfig, 'topic'>,
    private readonly additionalTopics?: string[]
  ) {}

  startProcessingRequests(): void {
    consumeFromKafka(
      this,
      process.env.KAFKA_HOST,
      process.env.KAFKA_PORT,
      getNamespacedMicroserviceName(),
      this.defaultTopicConfig,
      this.additionalTopics
    );
  }
}
