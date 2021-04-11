import { ITopicConfig } from "kafkajs";
export default function startKafkaConsumer(appController: any, defaultTopicConfig?: Omit<ITopicConfig, 'topic'>, additionalTopics?: string[]): Promise<void>;
