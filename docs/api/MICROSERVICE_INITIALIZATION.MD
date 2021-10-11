### Initialization

- [initialize](#initialize)
- [startHttpServerFor](#startHttpServerFor)
- [startKafkaConsumerFor](#startKafkaConsumerFor)
- [startRedisConsumerFor](#startRedisConsumerFor)

#### <a name="initialize"></a> initialize

```typescript
async function initialize(microservice: Microservice);
```

Initializes the microservice.

#### <a name="startHttpServerFor"></a> startHttpServerFor

```typescript
async function startHttpServerFor(
  microservice: Microservice,
  options?: ServiceFunctionExecutionOptions,
  httpVersion: HttpVersion = 1
);

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

type HttpVersion = 1;
```

Starts an HTTP server for the microservice.
Uses port defined in HTTP_SERVER_PORT environment variable or port 3000.
Currently, only HTTP/1.1 is support (HTTP/2 support is coming).
`initialize(microservice)` must be called before starting HTTP server.

#### <a name="startKafkaConsumerFor"></a> startKafkaConsumerFor

```typescript
async function startKafkaConsumerFor(
  microservice: Microservice,
  defaultTopicConfig?: Omit<ITopicConfig, 'topic'>,
  additionalTopics?: string[]
);

interface ITopicConfig {
  numPartitions?: number;
  replicationFactor?: number;
  replicaAssignment?: object[];
  configEntries?: object[];
}
```

Starts a Kafka consumer for the microservice.
Kafka host is defined in environment variable KAFKA_SERVER. If environment variable is not defined, an exception will be thrown.
Consumer is listening to topic named: `<service-name>.<service-namespace>`, e.g. my-service.default or notification-service.platform
`initialize(microservice)` must be called before starting Kafka consumer.

#### <a name="startRedisConsumerFor"></a> startRedisConsumerFor

```typescript
async function startRedisConsumerFor(microservice: Microservice);
```

Starts a Redis consumer for the microservice.
Redis host is defined in environment variable REDIS_SERVER. If the environment variable is not defined, an exception will be thrown.
Redis consumer is reading a list with a key named: `<service-name>.<service-namespace>`, e.g. my-service.default or notification-service.platform
`initialize(microservice)` must be called before starting Redis consumer.
