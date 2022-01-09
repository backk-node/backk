## Starting Microservice

In microservice's `main.ts` file, you will start the microservice:

main.ts
```ts
// organize-imports-ignore
import 'reflect-metadata';
import { HttpServer, initializeDefaultJaegerTracing } from 'backk';
import microservice from './microservice';

initializeDefaultJaegerTracing();
microservice.start([new HttpServer()]);
```

The argument is the list of request processor instances to be started.
For `HttpServer` constructor you can specify the HTTP version `1` or `2`, where `1` is the default.

### Request Processors
Following request processor classes are available:
- `HttpServer`
- `KafkaConsumer`
- `RedisConsumer`

The below example will start HTTP/2 server and both Kafka and Redis consumers:

```ts
// organize-imports-ignore
import 'reflect-metadata';
import { HttpServer, KafkaConsumer, RedisConsumer, initializeDefaultJaegerTracing } from 'backk';
import microservice from './microservice';

initializeDefaultJaegerTracing();
microservice.start(process.argv, [new HttpServer(2), new KafkaConsumer(), new RedisConsumer()]);
```

#### Environment Variables for Configuring Request Processors

| Environment variable | Description                    | 
| -------------------- | ------------------------------ | 
| HTTP_SERVER_PORT     | Listening port for HTTP server | 
| KAFKA_HOST           | Hostname for Kafka server      |
| KAFKA_PORT           | Port for Kafka server          |
| REDIS_HOST           | Hostname for Redis server      |
| REDIS_PORT           | Port for Redis server          | 

More information about Request Processors is available [here.](../api/MICROSERVICE_INITIALIZATION.MD)
