import consumeFromRedis from "../remote/messagequeue/redis/consumeFromRedis";
import AbstractAsyncRequestProcessor from "./AbstractAsyncRequestProcessor";
import { CommunicationMethod } from "../remote/messagequeue/sendToRemoteService";

export default class RedisConsumer extends AbstractAsyncRequestProcessor {
  startProcessingRequests(): void {
    consumeFromRedis(this, process.env.REDIS_HOST, process.env.REDIS_PORT);
  }

  getCommunicationMethod(): CommunicationMethod {
    return 'redis';
  }
}
