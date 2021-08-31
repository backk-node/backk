import consumeFromKafka from "../remote/messagequeue/kafka/consumeFromKafka";
import { ITopicConfig } from "kafkajs";
import Microservice from "../microservice/Microservice";
import getServiceName from "../utils/getServiceName";
import getNamespacedServiceName from "../utils/getServiceNamespace";

// TODO check microservice is initialized before calling this function
export default async function startKafkaConsumerFor(
  microservice: Microservice,
  defaultTopicConfig?: Omit<ITopicConfig, 'topic'>,
  additionalTopics?: string[]
) {
  await consumeFromKafka(
    microservice,
    process.env.KAFKA_SERVER,
    getNamespacedServiceName(),
    defaultTopicConfig,
    additionalTopics
  );
}
