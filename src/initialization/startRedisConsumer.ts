import AbstractDataStore from "../datastore/AbstractDataStore";
import consumeFromRedis from "../remote/messagequeue/redis/consumeFromRedis";

export default async function startRedisConsumer(appController: any) {
  await consumeFromRedis(appController, process.env.REDIS_SERVER, 'notification-service.vitja');
}
