## Request Processors

- [HttpServer](#httpServer)
- [KafkaConsumer](#kafkaConsumer)
- [RedisConsumer](#redisConsumer)

### <a name="httpServer"></a> HttpServer

```typescript
export default class HttpServer implements RequestProcessor {
  constructor(
    private readonly httpVersion: HttpVersion = 1,
    private readonly options?: ServiceFunctionExecutionOptions
  ) {
  }
}

type HttpVersion = 1 | 2;

interface ServiceFunctionExecutionOptions {
  isMetadataServiceEnabled?: boolean;
  httpGetRequests?: {
    regExpForAllowedServiceFunctionNames?: RegExp;
    deniedServiceFunctionNames?: string[];
  };
  multipleServiceFunctionExecution?: {
    isAllowed?: boolean;
    maxServiceFunctionCount?: number;
    shouldAllowTemplates?: boolean;
    regExpForAllowedRemoteServiceFunctionCalls?: RegExp;
  };
}
```

Represents a HTTP server for the microservice.
Uses port defined in HTTP_SERVER_PORT environment variable or port 3000.

### <a name="kafkaConsumer"></a> KafkaConsumer

```typescript
class KafkaConsumer extends AbstractAsyncRequestProcessor {
  constructor(
    private readonly defaultTopicConfig?: Omit<ITopicConfig, 'topic'>,
    private readonly additionalTopics?: string[]
  )
}

interface ITopicConfig {
  numPartitions?: number;
  replicationFactor?: number;
  replicaAssignment?: object[];
  configEntries?: object[];
}
```

Represents a Kafka consumer for the microservice.
Kafka server is defined with environment variables `KAFKA_HOST` and `KAFKA_PORT`. If environment variables are not defined, an exception will be thrown.
KafkaConsumer is consuming from topic named: `<microservice-name>.<service-namespace>`, e.g. `my-microservice.default` or `notification-service.platform`

### <a name="redisConsumer"></a> RedisConsumer

```typescript
class RedisConsumer extends AbstractAsyncRequestProcessor {
}
```

Represents a Redis consumer for the microservice.
Redis server is defined with environment variables `REDIS_HOST` and `REDIS_PORT`. If the environment variables are not defined, an exception will be thrown.
Redis consumer is consuming from the head of a list with a key named: `<microservice-name>.<service-namespace>`, e.g. `my-microservice.default` or `notification-service.platform`
