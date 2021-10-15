## Microservice Initialization

### Initialize Microservice

In microservice's `main.ts` file, you need to initialize microservice:

```ts
import { initialize } from 'backk';
import microservice from './microservice';

async function startMicroservice() {
  await initialize(microservice, process.argv);
}

startMicroservice();
```

The second argument for the `initialize` function is the command line arguments.
The third argument `shouldGeneratePostmanIntegrationTestsOnRestartInDevEnv` for the `initialize` function is optional and default value is true.

### Start HTTP Server and/or Kafka/Redis Consumers

The last phase of the initialization is to start needed HTTP Server and/or Kafka/Redis consumers in `main.ts`.

The below example will start HTTP server and both Kafka and Redis consumers:

```ts
import { initialize } from 'backk';
import microservice from './microservice';

async function startMicroservice() {
  await initialize(microservice, process.argv);

  // Remove below a 'startXXX' call when you don't need it
  await startHttpServerFor(microservice);
  await startKafkaConsumerFor(microservice);
  await startRedisConsumerFor(microservice);
}

startMicroservice();
```

#### HTTP Server, Kafka and Redis Configuration

Used Http server and Kafka/Redis consumer is configured via environement variables:

| Environment variable | Description                    | 
| -------------------- | ------------------------------ | 
| HTTP_SERVER_PORT     | Listening port for HTTP server | 
| KAFKA_HOST           | Hostname for Kafka server      |
| KAFKA_PORT           | Port for Kafka server          |
| REDIS_HOST           | Hostname for Redis server      |
| REDIS_PORT           | Port for Redis server          | 
