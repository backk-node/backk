import consumeFromKafka from "../remote/messagequeue/kafka/consumeFromKafka";
import { ITopicConfig } from "kafkajs";

export default async function startKafkaConsumer(
  appController: any,
  defaultTopicConfig?: Omit<ITopicConfig, 'topic'>,
  additionalTopics?: string[]
) {
  await consumeFromKafka(
    appController,
    process.env.KAFKA_SERVER,
    'notification-service.vitja',
    defaultTopicConfig,
    additionalTopics
  );
}
