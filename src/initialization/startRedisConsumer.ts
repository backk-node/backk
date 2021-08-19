import consumeFromRedis from "../remote/messagequeue/redis/consumeFromRedis";
import Microservice from "../microservice/Microservice";

export default async function startRedisConsumer(microservice: Microservice) {
  await consumeFromRedis(microservice, process.env.REDIS_SERVER, 'notification-service.vitja');
}
