import consumeFromKafka from "../remote/messagequeue/kafka/consumeFromKafka";
import { ITopicConfig } from "kafkajs";
import Microservice from "../microservice/Microservice";
import getNamespacedServiceName from "../utils/getNamespacedServiceName";

// TODO check microservice is initialized before calling this function
export default async function startKafkaConsumerFor(
  microservice: Microservice,
  defaultTopicConfig?: Omit<ITopicConfig, 'topic'>,
  additionalTopics?: string[]
) {
  await consumeFromKafka(
    microservice,
    process.env.KAFKA_HOST,
    process.env.KAFKA_PORT,
    getNamespacedServiceName(),
    defaultTopicConfig,
    additionalTopics
  );
}
