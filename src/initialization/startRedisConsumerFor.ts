import consumeFromRedis from "../remote/messagequeue/redis/consumeFromRedis";
import Microservice from "../microservice/Microservice";

// TODO check microservice is initialized before calling this function
export default async function startRedisConsumerFor(microservice: Microservice) {
  await consumeFromRedis(microservice, process.env.REDIS_HOST, process.env.REDIS_PORT);
}
