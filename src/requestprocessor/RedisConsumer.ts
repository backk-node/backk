import { RequestProcessor } from "./RequestProcessor";
import consumeFromRedis from "../remote/messagequeue/redis/consumeFromRedis";

export default class RedisConsumer implements RequestProcessor {
  startProcessingRequests(): void {
    consumeFromRedis(this, process.env.REDIS_HOST, process.env.REDIS_PORT);
  }
}
