## Request Processors

- [HttpServer](#http-server)
- [KafkaConsumer](#kafka-consumer)
- [RedisConsumer](#redis-consumer)

### <a name="http-server"></a> HttpServer

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
    maxServiceFunctionCount?: number;
    regExpForAllowedRemoteServiceFunctionCalls?: RegExp;
  };
}
```

Represents an HTTP server for the microservice.
Uses port defined in HTTP_SERVER_PORT environment variable or port 3001.

`isMetadataServiceEnabled` specifies if metadata data can be requested from the metadata service endpoints: 
- `metadataService.getServicesMetadata`
- `metadataService.getOpenApiSpec`

`httpGetRequests.regExpForAllowedServiceFunctionNames` is a regular expression which specifies which service function names can be requested
with HTTP GET method. For example: `/\.get/` allows all service function whose name contains `.get` to be accessed with HTTP GET method.

`httpGetRequests.deniedServiceFunctionNames` is a list of service function names for which HTTP GET method is not allowed.
This parameter can be used as a blacklist of service function names whose argument is or can be so big that it does not fit in HTTP GET request URL query string.

`multipleServiceFunctionExecution.maxServiceFunctionCount` specifies how many service functions can be called in one request.

`multipleServiceFunctionExecution.regExpForAllowedRemoteServiceFunctionCalls` is a regular expression that specifies which remote service functions can be called when executing multiple service function calls. If you want that your microservice enables execution of remote service functions you need to supply this parameter.
For example: `/.+/`

### <a name="kafka-consumer"></a> KafkaConsumer

```typescript
import { AbstractAsyncRequestProcessor, KafkaConsumer } from 'backk';
import { ITopicConfig } from 'kafkajs';

class KafkaConsumer extends AbstractAsyncRequestProcessor {
  constructor(
    private readonly defaultTopicConfig?: Omit<ITopicConfig, 'topic'>,
    private readonly additionalTopics?: string[]
  )
}

interface ITopicConfig {
  replicaAssignment?: object[];
  configEntries?: object[];
}
```

Represents a Kafka consumer for the microservice.
Kafka server is defined with environment variables `KAFKA_HOST` and `KAFKA_PORT`. If environment variables are not defined, an exception will be thrown.
Kafka consumer is consuming from a default topic named: `<microservice-name>.<service-namespace>`, e.g. `my-microservice.default` or `notification-service.platform`
If the topic does not exist, it will be created by the Kafka consumer.
Environment variable `KAFKA_DEFAULT_TOPIC_NUM_PARTITIONS` defines the number of partitions for the default topic, if environment variable is not defined 3 partitions will be created.
Environment variable `KAFKA_DEFAULT_TOPIC_REPLICATION_FACTOR` defines the replication factor for the default topic, if environment variable is not defined replication factor 3 will be used.
Environment variable `KAFKA_DEFAULT_TOPIC_RETENTION_MS` defines the retention period in milliseconds for the default topic, if environment variable is not defined, 30 minutes will be used as the retention period.
Additional default topic configuration can be supplied with `defaultTopicConfig` argument. 'retention.ms' configuration entry supplied with `defaultTopicConfig` will override the one supplied with environment variable `KAFKA_DEFAULT_TOPIC_RETENTION_MS`

`additionalTopics` specifies a list of topic names that the Kafka consumer will listen to. If these topics don't exist, they won't be created automatically.

You can send service function requests from remote Backk microservices for the Kafka consumer using [`sendToRemoteService`](REMOTE_SERVICE_ACCESS.MD#sendtoremoteservice) function

### <a name="redis-consumer"></a> RedisConsumer

```typescript
class RedisConsumer extends AbstractAsyncRequestProcessor {
}
```

Represents a Redis consumer for the microservice.
Redis server is defined with environment variables `REDIS_HOST` and `REDIS_PORT`. If the environment variables are not defined, an exception will be thrown.
Redis consumer is consuming from the head of a list (LPOP) with a key named: `<microservice-name>.<service-namespace>`, e.g. `my-microservice.default` or `notification-service.platform`

You can send service function requests from remote Backk microservices for the Redis consumer using [`sendToRemoteService`](REMOTE_SERVICE_ACCESS.MD#sendtoremoteservice) function

