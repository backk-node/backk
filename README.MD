[![version][version-badge]][package]
[![Downloads][downloads]][package]
[![MIT License][license-badge]][license]

<h1 align="center">Backk<br/></h1>
<h2 align="center">Node.js framework for creating secure cloud-native microservices for Kubernetes in Typescript</h2>
<h3 align="center">An RPC style replacement for REST and GraphQL</h3>
<h4 align="center"><i>:construction_worker: :building_construction: Backk is currently in alpha phase</i></h4>

## Table of Contents

- [Features](#features)
- [Prerequisites](#prerequisites)
- [Get Started](#get-started)
- [Sample Microservice](#sample-microservice)
- [Usage Documentation](#usage-documentation)
- [API Documentation](#api-documentation)
  - [Microservice](#api-documentation-microservice)
  - [Initialization](#api-documentation-initialization)
  - [Base Services](#api-documentation-base-services)
  - [Decorators](#api-documentation-decorators)
  - [AbstractDataStore](#api-documentation-abstractdatastore)
- [Feedback](#feedback)
  - [Report a Bug](#report-bug)
  - [Report a Security Vulnerability](#report-security-vulnerability)
  - [Request a New Feature](#request-new-feature)
  - [Request a Documentation Improvement](#request-documentation-improvement)
  - [Ask a Question](#ask-question)
- [Contributing](#contributing)
- [Sponsor](#sponsor)
- [License](#license)

## <a name="features"></a> Features

- Create synchronous and asynchronous microservices using
  - HTTP
  - Apache Kafka
  - Redis
- Write our microservices using Typescript and plain functions that are called by remote clients
  - No need for learning any technology like REST API, GraphQL or gRPC
  - Can be used for resource based or RPC based microservices
- Supports multiple databases
  - PostgreSQL
  - MySQL
  - MongoDB
  - MariaDB
  - Vitess (MySQL compatible)
  - YugabyteDB (PostgreSQL compatible)
  - CockroachDB (PostgreSQL compatible)
- ORM (Object-relational mapper)
  - Entities
  - Validations
- Automatic database schema generation
- Security
  - OAuth 2.0 Auhtorization support
  - Captcha Verification support
  - Automatic password hashing using Argon2 algorithm
  - Automatic PII encryption/decryption
  - Mandatory validation required by Entity field type
    - e.g. string field must have a maximum length validation
- Redis Response Cache support
- Automatic microservice documentation generation
  - TypeDoc
  - Postman
- Automatic microservice integration test generation
- Built-in Observability
  - Distributed tracing using OpenTelemetry API (Jaeger)
  - Logging using Open Telemetry specification
  - Metrics collection using OpenTelemetry API (Prometheus)
- Scheduled functions
  - Scheduled as per client request
  - Cron jobs
- Liveness, Readiness and Startup probes support

## <a name="prerequisites"></a> Prerequisites

1. [Node.js](https://nodejs.org/en/download/) >= 12.19
2. If your microservice uses a database, you need to install a local instance of the database or have a remote instance available, for example a cloud database.
   You can also run a database in a container. For running a container in Mac or Windows, you need to install [Docker Desktop](https://www.docker.com/products/docker-desktop). You can use same database installation for developing multiple Backk microservices. For local database installations:
   - [Download and install PostgreSQL](https://www.postgresql.org/download/) or [run PostgreSQL in a container](https://hub.docker.com/_/postgres)
   - [Download and install MySQL](https://www.mysql.com/downloads/) or [run MySQL in a container](https://hub.docker.com/_/mysql)
   - [Download and install MariaDB](https://mariadb.org/download/) or [run MariaDB in a container](https://hub.docker.com/_/mariadb)
   - [Download and install MongoDB](https://www.mongodb.com/try/download/community) or [run MongoDB in a container](https://hub.docker.com/_/mongo)
   - [Download and install Vitess](https://vitess.io/docs/get-started/local/) or [run Vitess in a container](https://vitess.io/docs/get-started/local-docker)
   - [Download and install CockroachDB](https://www.cockroachlabs.com/docs/stable/install-cockroachdb.html) or [run CockroachDB in a container](https://hub.docker.com/r/cockroachdb/cockroach)
   - [Download and install YugabyteDB](https://download.yugabyte.com/) or [run YugabyteDB in a container](https://hub.docker.com/r/yugabytedb/yugabyte)
3. If your microservice uses Kafka, you need to install a local instance of Kafka or have a remote instance available, for example in cloud.
   - [Download and install Kafka](https://kafka.apache.org/downloads) or [run Kafka in a container](https://hub.docker.com/r/wurstmeister/kafka)
4. If your microservice uses Redis (as message queue and/or response cache), you need to install a local instance of Redis or have a remote instance available, for example in cloud.
   - [Download and install Redis](https://redis.io/download) or [run Redis in a container](https://hub.docker.com/_/redis)

## <a name="get-started"></a> Get Started
 - [Development environment](#development-environment)
 - [Integration testing in development environment](#integration-testing-in-development-environment)
 - [CI/CD](#cicd)

### <a name="development-environment"></a> Development environment

Follow the below steps: (In the future, there will be [backk-cli](https://github.com/backk-node/backk-cli) available, which can be used to generate a Backk project based on a set of questions)

1. Clone [Backk starter project](https://github.com/backk-node/backk-starter) to a directory named after your microservice
   ```bash
   # Using SSH
   git clone git@github.com:backk-node/backk-starter.git <your-microservice-name>
   # Or using HTTPS
   git clone https://github.com/backk-node/backk-starter.git <your-microservice-name>
   
   cd <your-microservice-name>
   ```
2. Complete all 3 TODOs in `src/main.ts` and `src/MyMicroservice.ts` files
3. Check that the environment variable values in the `.env.dev` file are correct for your development environment
   - If you are using MongoDB, check
     - `MONGODB_HOST`
     - `MONGODB_PORT`
     - `MONGODB_USER`
     - `MONGODB_PASSWORD`
   - If you are using MySQL/MariaDB or MySQL compatible database, check
     - `MYSQL_HOST`
     - `MYSQL_PORT`
     - `MYSQL_USER`
     - `MYSQL_PASSWORD`
   - If you are using PostgreSQL or PostgreSQL compatible database, check
     - `POSTGRESQL_HOST`
     - `POSTGRESQL_PORT`
     - `POSTGRESQL_USER`
     - `POSTGRESQL_PASSWORD`
   - If you are using Kafka, check
     - `KAFKA_HOST`
     - `KAFKA_PORT`
   - if you are using Redis as a message queue, check
     - `REDIS_HOST`
     - `REDIS_PORT`
   - if you are using Redis as a response cache, check
     - `REDIS_CACHE_HOST`
     - `REDIS_CACHE_PORT`
4. OPTIONAL STEP: Remove unnecessary dependencies from `package.json`file
   - If you are using MongoDB, remove following lines:
     ```
     "@opentelemetry/plugin-mysql": "0.11.0",
     "@opentelemetry/plugin-pg": "0.11.0",
     "mysql2": "2.2.5",
     "pg": "^8.0.2",
     ```
   - If you are using MySQL/MariaDB or MySQL compatible database, remove following lines:
     ```
     "@opentelemetry/plugin-mongodb": "0.11.0",
     "@opentelemetry/plugin-pg": "0.11.0",
     "mongodb": "^3.6.6",
     "pg": "^8.0.2",
     ```
   - If you are using PostgreSQL or PostgreSQL compatible database, remove following lines:
     ```
     "@opentelemetry/plugin-mongodb": "0.11.0",
     "@opentelemetry/plugin-mysql": "0.11.0",
     "mongodb": "^3.6.6",
     "mysql2": "2.2.5",
     ```
   - If you are **NOT** using any database, remove following lines:
     ```
     "@opentelemetry/plugin-mongodb": "0.11.0",
     "@opentelemetry/plugin-mysql": "0.11.0",
     "@opentelemetry/plugin-pg": "0.11.0",
     "mongodb": "^3.6.6",
     "mysql2": "2.2.5",
     "pg": "^8.0.2",
     ```
   - If you are **NOT** using Kafka, remove following line:
     ```
     "kafkajs": "^1.15.0",
     ```
   - If you are **NOT** using Redis, remove following lines:
     ```
     "@opentelemetry/plugin-ioredis": "0.11.0",
     "ioredis": "^4.19.2",
     ```
5. Run
   ```bash
   npm install
   npm run start:dev
   
   # to run unit tests
   npm test
   ```
   There is one example service in `src/services/example` directory that you can use as a basis for your own service(s).
   If/When you don't need that example service anymore, just delete the `src/services/example` directory and remove example service from `MicroserviceImpl` class.
6. You can test your microservice API using [Postman](https://www.postman.com/downloads/)
   1. Launch Postman
   2. Choose Import and then choose file `postman/<your-microservice-name>_api_postman_collection.json`

### <a name="integration-testing-in-development-environment"></a> Integration testing in development environment

### <a name="cicd"></a> CI/CD

## <a name="example-microservice"></a> Example Microservice

If you want to dive right into the deep end, check out the Backk example microservice [here.](https://github.com/backk-node/backk-example-project)

## <a name="usage-documentation"></a> Usage Documentation

## <a name="api-documentation"></a> API Documentation

### <a name="api-documentation-microservice"></a> Microservice

Create a new `MicroserviceImpl` class by extending the class `Microservice`.
Add your one or more service(s) that comprise the microservice as private readonly fields of the `MicroserviceImpl` class.

```typescript
import { MySqlDataStore } from 'backk';

const dataStore = new MySqlDataStore();

class MicroserviceImpl extends Microservice {
  private readonly userAccountService = new UserAccountServiceImpl(dataStore);

  constructor() {
    super(dataStore);
  }
}
```

In the example above, there is one service `userAccountService` in the microservice which can be accessed over HTTP like this:

```
POST http://<user-account-microservice-host>:<port>/userAccountService
```

If the `userAccountService` has function `createUser`, it can be accessed over HTTP like this:

```
POST http://<user-account-microservice-host>:<port>/userAccountService.createUser
```

The argument for the service function call `userAccountService.createUser` is sent in the HTTP POST request message body encoded in JSON

### <a name="api-documentation-initialization"></a> Initialization
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
)

eexport interface ServiceFunctionExecutionOptions {
  isMetadataServiceEnabled?: boolean;
  httpGetRequests?: {
    regExpForAllowedServiceFunctionNames?: RegExp;
    deniedServiceFunctionNames?: string[];
  },
  multipleServiceFunctionExecution?: {
    isAllowed?: boolean;
    maxServiceFunctionCount?: number;
    shouldAllowTemplates?: boolean;
    regExpForAllowedRemoteServiceFunctionCalls?: RegExp;
  }
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

### <a name="api-documentation-base-services"></a> Base Services
- [BaseService](#baseservice)
- [CrudEntityService](#crudentityservice)
- [UserAccountBaseService](#useraccountbaseservice)
- [AuthorizationService](#authorizationservice)
- [JwtAuhtorizationServiceImpl](#jwtauthorizationserviceimpl)
- [ResponseCacheConfigService](#responsecacheconfigservice)
- [CaptchaVerificationService](#captchaverificationservice)
- [LivenessCheckService](#livenesscheckservice)
- [ReadinessCheckService](#readinesscheckservice)
- [StartupCheckService and StartupCheckServiceImpl](#startupcheckservice)
- [AuditLoggingService](#auditloggingservice)

#### <a name="baseservice"></a> BaseService
A base class for your own services.

```ts
export default class BaseService implements Service {
  constructor(
    private readonly errorNameToErrorDefinitionMap: ErrorNameToErrorDefinitionMap,
    protected readonly dataStore: AbstractDataStore
  ) {
  }
}

export type ErrorDefinition = {
  readonly errorCode: string;
  readonly message: string;
  readonly statusCode?: number;
};

export type ErrorNameToErrorDefinitionMap = { [errorName: string]: ErrorDefinition };
```

Implement your own service class by extending `BaseService` class.
When calling base class constructor, you must provide:
- error definitions for your service (or empty object, if your service does not raise any errors)
- data store used by your service (if you are not using a data store, provide an instance of `NoOpDataStore`)

Then, instantiate your class and store it as a field in your `MicroserviceImpl` class:
```typescript
export default class MicroserviceImpl extends Microservice {
  private readonly myService = new MyServiceImpl();
}
```

#### <a name="crudentityservice"></a> CrudEntityService
A base class for your own resource-based services for creating, reading, updating and deleting entities.
NOTE! It is not mandatory to use CrudEntityService as base class for you resource-based services, you can also use just `BaseService` as a base class.

Functions in `CrudEntityService` based services must follow the following rules:
- Create function names must start with *create* or *insert* or function must be annotated with `@Create()`
- Read function names must start with *get*, *read*, *find*, *fetch*, *retrieve* or *obtain* or function must be annotated with `@Read()`
- Update function names must start with *update*, *modify*, *change* or *patch* or function must be annotated with `@Update()` 
- Delete function names must start with *delete*, *erase* or *destroy* or function must be annotated with `@Delete()`

Using above naming conventions or annotations, Backk is able to generate automatic integration tests.
If the above rules are not followed, an exception will be thrown.

Implement your own service class by extending `CrudEntityService` class.

When calling base class constructor, you must provide:
- error definitions for your service (or empty object, if your service does not raise any errors)
- data store used by your service (if you are not using a data store, provide an instance of `NoOpDataStore`)

Then, instantiate your class and store it as a field in your `MicroserviceImpl` class:
```typescript
export default class MicroserviceImpl extends Microservice {
  private readonly myService = new MyServiceImpl();
}
```

#### <a name="useraccountbaseservice"></a> UserAccountBaseService
Each microservice which has one or more service functions that have annotation `@AllowForSelf()` 
must implement a service extending `UserAccountBaseService`. Otherwise, an exception is thrown upon authorization.

Implement your own service class by extending `UserAccountBaseService` class and
implement following function:
- getUserNameById

Then, instantiate your class and store it as a field in your `MicroserviceImpl` class:
```typescript
export default class MicroserviceImpl extends Microservice {
  private readonly myService = new MyServiceImpl();
}
```

#### <a name="authorizationservice"></a>AuthorizationService
Authorizes client requests based on Auhtorization header

```typescript
export default abstract class AuthorizationService {
  abstract hasUserRoleIn(roles: string[], authHeader: string | string[] | undefined): Promise<boolean>;
  abstract getSubject(
    authHeader: string | string[] | undefined
  ): Promise<string | undefined>;
}
```

`authHeader` argument contains the Authorization header content, e.g. `Bearer vF9dft4qmT...`.

Implement a class that extends the `AuthorizationService` class and provide implementations for function:
- hasUserRoleIn
- getSubject

Then, instantiate your class and store it as a field in your `MicroserviceImpl` class:
```typescript
export default class MicroserviceImpl extends Microservice {
  private readonly authorizationService = new AuthorizationServiceImpl();
}
```

#### <a name="jwtauthorizationserviceimpl"></a> JwtAuthorizationServiceImpl

JWT authorization service which checks if user is authorized based JWT bearer token supplied in Authorization header.
This service requires following environment variables to be defined:
- `AUTH_SERVER_PUBLIC_KEY_URL` defines the Authorization Server URL where to fetch the JWT signing public key. (Needed only in production environment), for example `https://keycloak.platform.svc.cluster.local:<port>/auth/realms/<my-realm>` or `https://keycloak.platform.svc.cluster.local:<port>/auth/realms/<my-realm>/protocol/openid-connect/certs`
- `PUBLIC_KEY_PATH` path where public key is available in public key fetch response, for example: `public_key` or `keys[0].n`
- `JWT_ROLES_CLAIM_PATH` JWT path where for user's roles, for example `realm_access.roles`

In non-production environments, Authorization server as defined by `AUTH_SERVER_PUBLIC_KEY_URL` environment variable, is not contacted, but signing secret defined in `JWT_SIGN_SECRET` in used to sign/verify JWT.

To use JWT authorization service, instantiate JwtAuthorizationServiceImpl class and store it as a field in your `MicroserviceImpl` class:

```typescript
export default class MicroserviceImpl extends Microservice {
  private readonly authorizationService = new JwtAuthorizationServiceImpl();
}
```

#### <a name="responsecacheconfigservice"></a> ResponseCacheConfigService
Caches service function call responses in Redis for a defined period of time. Caching can be customized by service function name and its argument.
Caching is performed only for HTTP requests with GET method.

For security reasons, each microservice should have its own Redis cache instance with following requirements:
* Redis authentication with password is required
* Redis persistence is not used
* Connection between microservice and Redis is secured (mTLS by a service mesh)

```typescript
export default abstract class ResponseCacheConfigService {
  abstract shouldCacheServiceFunctionCallResponse(serviceFunctionName: string, serviceFunctionArgument: object): boolean
  abstract getCachingDurationInSecs(serviceFunctionName: string, serviceFunctionArgument: object): number;
}
```

This service requires following environment variables to be defined:
* `REDIS_CACHE_SERVER` which denotes the Redis server in form <host>:<port> 
* `REDIS_CACHE_PASSWORD` which denotes the Redis server password

Implement a class that extends the `ResponseCacheConfigService` class and provide implementations for functions:
- shouldCacheServiceFunctionCallResponse
- getCachingDurationInSecs

Then, instantiate your class and store it as a field in your `MicroserviceImpl` class:
```typescript
export default class MicroserviceImpl extends Microservice {
  private readonly responseCacheConfigService = new ResponseCacheConfigServiceImpl();
}
```

#### <a name="captchaverificationservice"></a> CaptchaVerificationService
Verifies captcha send in service function call argument in `captchaToken` property:
```json
{
  "captchaToken": "<captcha-token>"
}
```

```typescript
export default abstract class CaptchaVerificationService {
  abstract verifyCaptcha(captchaToken: string): Promise<boolean>;
}
```

Implement a class that extends the `CaptchaVerificationService` class and provide implementations for function:
- verifyCaptcha

Then, instantiate your class and store it as a field in your `MicroserviceImpl` class:
```typescript
export default class MicroserviceImpl extends Microservice {
  private readonly captchaVerificationService = new CaptchaVerificationServiceImpl();
}
```

#### <a name="livenesscheckservice"></a> LivenessCheckService
This service is called by Kubernetes pod's liveness probe to check if microservice is alive.

```typescript
export default abstract class LivenessCheckService extends BaseService {
  abstract isMicroserviceAlive(): PromiseErrorOr<null>;
}
```

Implement a class that extends the `LivenessCheckService` class and provide implementations for function:
- isMicroserviceAlive

Simplest implementation for the function is:
```typescript
import { LivenessCheckService, PromiseErrorOr } from 'backk';

export default class LivenessCheckServiceImpl extends LivenessCheckService {
  isMicroserviceAlive(): PromiseErrorOr<null> {
    return Promise.resolve([null, null]);
  }
}

```
Then, instantiate your class and store it as a field in your `MicroserviceImpl` class:
```typescript
export default class MicroserviceImpl extends Microservice {
  private readonly livenessCheckService = new LivenessCheckServiceImpl();
}
```

#### <a name="readinesscheckservice"></a> ReadinessCheckService
This service is called by Kubernetes pod's readiness probe to check if microservice is ready for handling requests

```typescript
export default abstract class ReadinessCheckService extends BaseService {
  abstract isMicroserviceReady(): PromiseErrorOr<null>;
}
```

Implement a class that extends the `ReadinessCheckService` class and provide implementations for function:
- isMicroserviceReady

Example implementation, where you need to implement the `isReady` function by yourself:

```typescript
import { HttpStatusCodes, createBackkErrorFromErrorMessageAndStatusCode } from "backk";

export default class ReadinessCheckServiceImpl extends ReadinessCheckService {
  async isMicroserviceReady(): PromiseErrorOr<null> {
    if (await isReady()) {
      return [null, null];
    }

    const error = createBackkErrorFromErrorMessageAndStatusCode('Microservice is not ready', HttpStatusCodes.SERVICE_UNAVAILABLE);
    return [null, error];
  }
}
```

Then, instantiate your class and store it as a field in your `MicroserviceImpl` class:
```typescript
export default class MicroserviceImpl extends Microservice {
  private readonly readinessCheckService = new ReadinessCheckServiceImpl();
}
```

#### <a name="startupcheckservice"></a> StartupCheckService and StartupCheckServiceImpl
This service is called by Kubernetes pod's startup probe to check if microservice is started successfully.

```typescript
export default abstract class StartupCheckService extends BaseService {
  abstract isMicroserviceStarted(): PromiseErrorOr<null>;
}
```

`StartupCheckServiceImpl` is the default implementation that checks if database is initialized and jobs are scheduled.
If you need to make additional checks, implement a class that extends the `StartupCheckServiceImpl` class and provide implementations for function `isMicroserviceStarted`.
Your implementation for the function should first call the base class method and then execute additional checks.

Instantiate `StartupCheckServiceImpl` or your own class and store it as a field in your `MicroserviceImpl` class:
```typescript
export default class MicroserviceImpl extends Microservice {
  private readonly startupCheckService = new StartupCheckServiceImpl();
}
```

#### <a name="auditloggingservice"></a> AuditLoggingService
This service is called to log requests made to the microservice.

```typescript
export default abstract class AuditLoggingService {
  abstract async log(auditLogEntry: AuditLogEntry): Promise<void>;
}

export type UserOperationResult = 'success' | 'failure'

export interface AuditLogEntry {
  Timestamp: string;
  TraceId?: string;
  SpanId?: string;
  TraceFlags?: number;
  subject: string;
  clientIp: string;
  authorizationHeader: string;
  userOperation: string;
  userOperationResult: UserOperationResult;
  userOperationHttpStatusCode: number;
  userOperationErrorMessage: string;
  Resource: Resource;
  Attributes?: { [key: string]: string | number | boolean | undefined };
}
```

Implement a class that extends the `AuditLoggingService` class and provide implementations for function:
- log

Instantiate your class and store it as a field in your `MicroserviceImpl` class:
```typescript
export default class MicroserviceImpl extends Microservice {
  private readonly auditLogService = new AuditLogServiceImpl();
}
```

### <a name="api-documentation-decorators"></a> Decorators
- [Service decorators](#service-decorators)
- [Service Function Decorators](#service-function-decorators)
- [Entity Decorators](#entity-decorators)
- [Entity Property Decorators](#entity-property-decorators)
- [Validation Decorators](#validation-decorators)

#### <a name="service-decorators"></a> Service Decorators

You can use following decorators for your service implementation class:

| Decorator | Description |
|-----------|-------------|
| `@NoServiceAutoTests()`                         | Automatic integration tests are no generated for this service         |
| `@AllowServiceForEveryUser()`                   | Service can be accessed by any user             |
| `@AllowServiceForUserRoles(roles: string[])`    | Service can be accessed only by users with specific role or roles           |
| `@AllowServiceForClusterInternalUse()`          | Service can be accessed only from inside of Kubernetes cluster |

#### <a name="service-function-decorators"></a> Service Function Decorators

You can use following decorators for you service class's functions:

| Decorator | Description |
|-----------|-------------|
| `@AllowForEveryUser()`                   | Service function can be accessed by any user             |
| `@AllowForUserRoles(roles: string[])`    | Service function can be accessed only by users with specific role or roles           |
| `@AllowForClusterInternalUse()`          | Service function can be accessed only from inside of Kubernetes cluster |
| `@AllowForEveryUserForOwnResources()`    | Service function can be accessed by any user, but only for own resources |
| `@AllowForTests()`                       | Service function can be accessed by integration tests only |
| `@NoAutoTests()`                         | Automatic integration tests are not generated for this service function |
| `@CronJob(cronSchedule: CronSchedule, retryIntervalsInSecs: number[])` | Service function is a cron job that is executed according to given cron schedule. Type definition for `CronSchedule` is below this table. |
| `@Create()` | Service function is used to create a resource |
| `@Update(updateType: UpdateType)` | Service function is used to update a resource | 
| `@Delete()` | Service function is used to delete a resource |
| `@ExecuteOnStartup()` | Service function is executed when microservice is started |
| `@NoCaptcha()` | This denotes that Captcha is not required when service function is creating a resource |
| `@NoTransactionNeeded(reason: string)` | Service function execution does not require a transaction due to given reason |
| `@NoDistributedTransactionNeeded(reason: string)` | Service function execution does not require a distributed transaction due to given reason |
| `@ResponseHeaders<T extends object, U extends any>(headers: HttpHeaders<T, U>)` | Given headers are sent with the service function response. Type definition for `HttpHeaders` is below this table. |
| `@ResponseStatusCode(statusCode: number)` | Service function response is sent with given status code |

```ts
type Range = {
  start: number;
  end: number;
};

type CronSchedule = {
  minutes?: number | number[] | Range | 'any';
  minuteInterval?: number;
  hours?: number | number[] | Range | 'any';
  hourInterval?: number;
  daysOfMonth?: number | number[] | Range | 'any';
  dayInterval?: number;

  // 0 - 11
  months?: number | number[] | Range | 'any';
  monthInterval?: number;

  // 0-6 (Sun-Sat)
  daysOfWeek?: number | number[] | Range;
  weekDayInterval?: number;
};

type HeaderValueGenerator<T extends object, U extends any> = (
  argument: T,
  returnValue: U
) => string | undefined;

type HttpHeaders<T extends object, U extends any> = {
  [key: string]: string | HeaderValueGenerator<T, U> | undefined;
};
```

#### <a name="entity-decorators"></a> Entity Decorators

You can use following decorators for your entity classes:

Decorator | Description |
|-----------|-------------|
| `@Entity()`                         | Denotes that this class is an entity         |
| `@CompositeIndex(indexFields: string[], usingOption?: string, additionalSqlCreateIndexStatementOptions?: string)` | Creates a composite index for entity database table using given fields |
| `@UniqueCompositeIndex(indexFields: string[], usingOption?: string, additionalSqlCreateIndexStatementOptions?: string)`    | Same as above but index is unique |

#### <a name="entity-property-decorators"></a> Entity Property Decorators

You can use following decorators for the properties of your entity classes:

Decorator | Description |
|-----------|-------------|
| `@Encrypted()`                     | Entity property value is encrypted in database |
| `@Encrypted(reason: string)`       | Entity property value is not needed to be encrypted in database because of given reason |
| `@Hashed()`                        | Entity property value is hashed in database |
| `@NotHashed(reason: string)`       | Entity property value is not needed to be hashed in database because of given reason |
| `@TestValue(testValue: any)`       | Entity property should have this value in automatic integration tests |
| `@Index(sortOrder?: SortOrder, usingOption?: string, additionalSqlCreateIndexStatementOptions?: string)` | Entity property is indexed in database according to given sort order ('ASC' or 'DESC') |
| `@FetchFromRemoteService(remoteServiceFunctionUrl: string, buildRemoteServiceFunctionArgument: (arg: T, response: U) => { [key: string]: any }, options?: HttpRequestOptions)` | Entity property value is fetched from the given remote URL with given argument |
| `@OneToMany(isReferenceToExternalEntity = false)` | Entity property is a one-to-many mapping to another entity  |
| `@ManyToMany()` | Entity property is a many-to-many mapping to another entity |
| `@UiProperties(uiProperties: UiProps)` | Entity property has the given UI properties |
| `@Transient()` | Entity property is not stored in database |
| `@Private()` | Entity property is private and cannot be accessed by clients (ie. it cannot be given in service function argument and is not visible in service function response) |
| `@ReadWrite()` | Entity property can be written and read by clients (ie. it can be given in service function argument and it is visible in service function response) |
| `@ReadOnly()` | Entity property can only be read by clients (ie. it cannot be given in service function argument, but it is visible in service function response) |
| `@ReadUpdate()` | Entity property can be read and given in update requests by clients (example of such property is `_id` property) |
| `@WriteOnly()` | Entity property can be only written by clients. (ie. it can be given in service function argument, but it is not visible in service function responses) |
| `@CreateOnly()` | Entity property can only be given in resource create requests by clients | 
| `@UpdateOnly()` | Entity property can only be given in resource update requests by clients |

```ts
type UiProps = {
  shouldDisplay: boolean,
  booleanValueInputType: 'switch' | 'checkbox'
}
```

#### <a name="validation-decorators"></a> Validation Decorators

## <a name="feedback"></a> Feedback

### <a name="report-bug"></a> Report Bug

If you find a bug, please [create a new bug report](https://github.com/backk-node/backk/issues/new/choose) about that

### <a name="report-security-vulnerability"></a> Report Security Vulnerability

If you find a security vulnerability, please [create a new bug report](https://github.com/backk-node/backk/issues/new/choose) about that

### <a name="request-new-feature"></a> Request New Feature

If you want to request a new feature or enhancement, please [create a new feature request](https://github.com/backk-node/backk/issues/new/choose) about that

### <a name="request-documentation-improvement"></a> Request Documentation Improvement

If you want to request an improvement to documentation, please [create a new documentation improvement request](https://github.com/backk-node/backk/issues/new/choose) about that

### <a name="ask-question"></a> Ask Question

If you want to ask a question

- submit your question to [Stack Overflow](https://stackoverflow.com/questions/ask) and remember to use tag _'backk'_
- [create a new issue](https://github.com/backk-node/backk/issues/new/choose) for your question

## <a name="contributing"></a> Contributing

If you are first time contributing to any open source project, you can check these tutorials:

- [first-contributions](https://github.com/firstcontributions/first-contributions)
- [Step-by-step guide to contributing on GitHub](https://www.dataschool.io/how-to-contribute-on-github/)

You can contribute to Backk open-source project in following ways:

- Fixing open bugs
  - [List of all open bugs](https://github.com/backk-node/backk/issues?q=is%3Aopen+is%3Aissue+label%3Abug)
  - [Lst of open bugs that are good first issues](https://github.com/backk-node/backk/issues?q=is%3Aopen+is%3Aissue+label%3Abug+label%3A%22good+first+issue%22)
- Implement new features and enhancements
  - [List of open new feature requests](https://github.com/backk-node/backk/issues?q=is%3Aopen+is%3Aissue+label%3Aenhancement)
- Improve documentation
  - [List of open documentation improvement requests](https://github.com/backk-node/backk/issues?q=is%3Aopen+is%3Aissue+label%3Adocumentation)
- Answer Backk related questions
  - [Stack Overflow](https://stackoverflow.com/questions/tagged/backk?tab=Unanswered)
  - [List of unanswered questions](https://github.com/backk-node/backk/issues?q=is%3Aopen+is%3Aissue+label%3Aquestion)
- Write unit tests
- Refactoring
  - Proper naming of function
  - Proper naming of function arguments and function variables
  - Function is split to multiple functions if it is long
  - Typescript types are restrictive enough (avoid 'any' type)
  - Optimization
  - Readability

You can request to assign a certain issue to yourself by [creating an issue assignment request](https://github.com/backk-node/backk/issues/new/choose)

## <a name="sponsor"></a>Sponsor

## <a name="license"></a>License

MIT License

[license-badge]: https://img.shields.io/badge/license-MIT-green
[license]: https://github.com/backk-node/backk/blob/master/LICENSE
[version-badge]: https://img.shields.io/npm/v/backk.svg?style=flat-square
[package]: https://www.npmjs.com/package/backk
[downloads]: https://img.shields.io/npm/dm/backk
