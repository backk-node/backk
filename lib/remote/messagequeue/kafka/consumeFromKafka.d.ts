import { ITopicConfig } from 'kafkajs';
export default function consumeFromKafka(controller: any, server: string | undefined, defaultTopic?: string, defaultTopicConfig?: Omit<ITopicConfig, 'topic'>, additionalTopics?: string[]): Promise<void>;
