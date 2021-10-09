import consumeFromKafka from "../remote/messagequeue/kafka/consumeFromKafka";
import { ITopicConfig } from "kafkajs";
import Microservice from "../microservice/Microservice";
import getNamespacedMicroserviceName from "../utils/getNamespacedMicroserviceName";

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
    getNamespacedMicroserviceName(),
    defaultTopicConfig,
    additionalTopics
  );
}
