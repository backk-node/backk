import consumeFromRedis from "../remote/messagequeue/redis/consumeFromRedis";
import AbstractAsyncRequestProcessor from "./AbstractAsyncRequestProcessor";
import { CommunicationMethod } from "../remote/messagequeue/sendToRemoteService";
import log, { Severity } from "../observability/logging/log";

export default class RedisConsumer extends AbstractAsyncRequestProcessor {
  startProcessingRequests(): void {
    consumeFromRedis(this, process.env.REDIS_HOST, process.env.REDIS_PORT);
    log(Severity.INFO, `Redis consumer started for Redis server: ${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`, '');

  }

  getCommunicationMethod(): CommunicationMethod {
    return 'redis';
  }
}
