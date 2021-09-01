[![version][version-badge]][package]
[![Downloads][Downloads]][package]
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
  - [AbstractDataStore](#api-documentation-abstractdatastore)
- [Feedback](#feedback)
  - [Bug Report](#bug-report)
  - [Security Vulnerability](#security-vulnerability)
  - [New Feature Request](#new-feature-request)
  - [Documentation Improvement Request](#documentation-improvement-request)
  - [Ask Question](#ask-question)
- [Contributing](#contributing)
- [Sponsor](#sponsor)
- [License](#license)

## <a name="features"></a> Features
* Create synchronous and asynchronous microservices using
  * HTTP
  * Apache Kafka
  * Redis
* Write our microservices using Typescript and plain functions that are called by remote clients
  * No need for learning any technology like REST API, GraphQL or gRPC
  * Can be used for resource based or RPC based microservices
* Supports multiple databases
  * PostgreSQL
  * MySQL
  * MongoDB
  * MariaDB
  * Vitess (MySQL compatible)
  * YugabyteDB (PostgreSQL compatible)
  * CockroachDB (PostgreSQL compatible)
* ORM (Object-relational mapper)
  * Entities
  * Validations
* Automatic database schema generation
* Security
  * OAuth 2.0 Auhtorization support
  * Captcha Verification support
  * Automatic password hashing using Argon2 algorithm
  * Automatic PII encryption/decryption
  * Mandatory validation required by Entity field type
    * e.g. string field must have a maximum length validation
* Redis Response Cache support
* Automatic microservice documentation generation
  * TypeDoc
  * Postman
* Automatic microservice integration test generation
* Built-in Observability
  * Distributed tracing using OpenTelemetry API (Jaeger)
  * Logging using Open Telemetry specification
  * Metrics collection using OpenTelemetry API (Prometheus)
* Scheduled functions
  * Scheduled as per client request
  * Cron jobs
* Liveness, Readiness and Startup probes support

## <a name="prerequisites"></a> Prerequisites
1. [Node.js](https://nodejs.org/en/download/) >= 12.19
2. If you are using a database, you need to install a local instance of the database or have a remote instance available, for example a cloud database. For local installations:
   * [Download PostgreSQL](https://www.postgresql.org/download/)
   * [Download MySQL](https://www.mysql.com/downloads/)
   * [Download MariaDB](https://mariadb.org/download/)
   * [Download MongoDB](https://www.mongodb.com/try/download/community)
   * [Download CockroachDB](https://www.cockroachlabs.com/docs/stable/install-cockroachdb.html)
   * [Download YugabyteDB](https://download.yugabyte.com/)

## <a name="get-started"></a> Get Started
Follow the below steps: (In the future, there will be [backk-cli](https://github.com/backk-node/backk-cli) available, which can be used to generate a Backk project based on a set of questions)

1. Clone [Backk starter project](https://github.com/backk-node/backk-starter)
   ```
   git clone git@github.com:backk-node/backk-starter.git <your-microservice-name>
   ```
2. Complete all 4 TODOs in `src/main.ts` and `src/MyMicroservice.ts` files
3. Update your microservice name to `package.json` and change the name `src/MyMicroservice.ts` to reflect your microservice name
4. Remove unused data stores:
    * If you are using MongoDB, remove
        * `src/datastores/mySqlDataStore.ts`
        * `src/datastores/postgreSqlDataStore.ts`
    * If you are using MySQL/MariaDB or MySQL compatible database, remove
        * `src/datastores/mongoDbDataStore.ts`
        * `src/datastores/postgreSqlDataStore.ts`
    * If you are using PostgreSQL or PostgreSQL compatible database, remove
        * `src/datastores/mySqlDataStore.ts`
        * `src/datastores/mongoDbDataStore.ts`
    * If you are **NOT** using any database, remove the `src/datastores` directory
5. Check that the environment variable values in the `.env` file are correct for your development environment
    * If you are using MongoDB, check
        * `MONGO_DB_URI`
    * If you are using MySQL/MariaDB or MySQL compatible database, check
        * `MYSQL_HOST`
        * `MYSQL_USER`
        * `MYSQL_PASSWORD`
    * If you are using PostgreSQL or PostgreSQL compatible database, check
        * `POSTGRESQL_HOST`
        * `POSTGRESQL_USER`
        * `POSTGRESQL_PASSWORD`
    * If you are using Kafka, check
        * `KAFKA_SERVER`
    * if you are using Redis, check
        * `REDIS_SERVER`
6. OPTIONAL STEP: Remove unnecessary dependencies from `package.json`file
    * If you are using MongoDB, remove following lines:
      ```
      "@opentelemetry/plugin-mysql": "0.11.0",
      "@opentelemetry/plugin-pg": "0.11.0",
      "mysql2": "2.2.5",
      "pg": "^8.0.2",
      ```
    * If you are using MySQL/MariaDB or MySQL compatible database, remove following lines:
      ```
      "@opentelemetry/plugin-mongodb": "0.11.0",
      "@opentelemetry/plugin-pg": "0.11.0",
      "mongodb": "^3.6.6",
      "pg": "^8.0.2",
      ```
    * If you are using PostgreSQL or PostgreSQL compatible database, remove following lines:
      ```
      "@opentelemetry/plugin-mongodb": "0.11.0",
      "@opentelemetry/plugin-mysql": "0.11.0",
      "mongodb": "^3.6.6",
      "mysql2": "2.2.5",
      ```
    * If you are **NOT** using any database, remove following lines:
       ```
      "@opentelemetry/plugin-mongodb": "0.11.0",
      "@opentelemetry/plugin-mysql": "0.11.0",
      "@opentelemetry/plugin-pg": "0.11.0",
      "mongodb": "^3.6.6",
      "mysql2": "2.2.5",
      "pg": "^8.0.2",
      ```
    * If you are **NOT** using Kafka, remove following line:
      ```
      "kafkajs": "^1.15.0",
      ```
    * If you are **NOT** using Redis, remove following lines:
      ```
      "@opentelemetry/plugin-ioredis": "0.11.0",
      "ioredis": "^4.19.2",
      ```
7. Run
    ```
    npm install
    npm run start:dev
    ```
8. You can test your microservice API using [Postman](https://www.postman.com/downloads/)
    1. Launch Postman
    2. Choose Import and then choose file `postman/<your-microservice-name>_api_postman_collection.json`

## <a name="example-microservice"></a> Example Microservice
If you want to dive right into the deep end, check out the Backk example microservice [here.](https://github.com/backk-node/backk-example-project)

## <a name="usage-documentation"></a> Usage Documentation

## <a name="api-documentation"></a> API Documentation

### <a name="api-documentation-microservice"></a> Microservice
Create a new microservice class by extending the class `Microservice`.
Add your one or more service(s) that comprise the microservice as private readonly members of the class.

```ts
import { Microservice } from 'backk';
import { mySqlDataStore } from './datastores/mySqlDataStore';

const dataStore = mySqlDataStore;

export default class UserAccountMicroservice extends Microservice {
  private readonly userAccountService = new UserAccountServiceImpl(dataStore);

  constructor() {
    super(dataStore);
  }
}
```

In the example above, there is one service `userAccountService` in the `UserAccountMicroservice` which can be accessed over HTTP like this:
```
POST http://<user-account-microservice-host>:<port>/userAccountService
```

If the `userAccountService` has function `createUser`, it can be accessed over HTTP like this:
```
POST http://<user-account-microservice-host>:<port>/userAccountService.createUser
```

The argument for the service function call `userAccountService.createUser` is sent in the HTTP POST request message body encoded in JSON

### <a name="api-documentation-initialization"></a> Initialization
#### initialize
```ts
async function initialize(microservice: Microservice)
```
Initializes the microservice.

#### startHttpServerFor
```ts
async function startHttpServerFor(
  microservice: Microservice,
  options?: ServiceFunctionExecutionOptions,
  httpVersion: HttpVersion = 1
)

eexport interface ServiceFunctionExecutionOptions {
  isMetadataServiceEnabled?: boolean;
  httpGetMethod?: {
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
*initialize(microservice)* must be called before starting HTTP server.

#### startKafkaConsumerFor
```ts
async function startKafkaConsumerFor(
  microservice: Microservice,
  defaultTopicConfig?: Omit<ITopicConfig, 'topic'>,
  additionalTopics?: string[]
)

interface ITopicConfig {
  numPartitions?: number
  replicationFactor?: number
  replicaAssignment?: object[]
  configEntries?: object[]
}
```
Starts a Kafka consumer for the microservice.
Kafka host is defined in environment variable KAFKA_SERVER. If environment variable is not defined, an exception will be thrown.
Consumer is listening to topic named: `<service-name>.<service-namespace>`, e.g. my-service.default or notification-service.platform
`initialize(microservice)` must be called before starting Kafka consumer.

#### startRedisConsumerFor
```ts
async function startRedisConsumerFor(microservice: Microservice)
```
Starts a Redis consumer for the microservice.
Redis host is defined in environment variable REDIS_SERVER. If the environment variable is not defined, an exception will be thrown.
Redis consumer is reading a list with a key named: `<service-name>.<service-namespace>`, e.g. my-service.default or notification-service.platform
`initialize(microservice)` must be called before starting Redis consumer.

### <a name="api-documentation-base-services"></a> Base Services

#### AuthorizationService
```ts
export default abstract class AuthorizationService {
  abstract hasUserRoleIn(roles: string[], authHeader: string | string[] | undefined): Promise<boolean>;
  abstract areSameIdentities(
    userName: string | undefined,
    authHeader: string | string[] | undefined
  ): Promise<boolean>;
}
```
`authHeader` argument contains the Authorization header content, e.g. `Bearer vF9dft4qmT...`.

Implement a class that extends the `AuthorizationService` class and provide implementations for functions:
* hasUserRoleIn
* areSameIdentities

Then, instantiate your AuthorizationService class and store it as `authorizationService` member in your Microservice class.
```ts
export default class MyMicroservice extends Microservice {
  private readonly authorizationService = new AuthorizationServiceImpl();
}
```

## <a name="feedback"></a> Feedback

### <a name="bug-report"></a> Bug Report
If you find a bug, please [create a new bug report](https://github.com/backk-node/backk/issues/new/choose) about that

### <a name="security-vulnerability"></a> Security Vulnerability
If you find a security vulnerability, please [create a new bug report](https://github.com/backk-node/backk/issues/new/choose) about that

### <a name="new-feature-request"></a> New Feature Request
If you want to request a new feature or enhancement, please [create a new feature request](https://github.com/backk-node/backk/issues/new/choose) about that

### <a name="documentation-improvement-request"></a> Documentation Improvement Request
If you want to request an improvement to documentation, please [create a new documentation improvement request](https://github.com/backk-node/backk/issues/new/choose) about that

### <a name="ask-question"></a> Ask Question
If you want to ask a question
 * submit your question to [Stack Overflow](https://stackoverflow.com/questions/ask) and remember to use tag *'backk'*
 * [create a new issue](https://github.com/backk-node/backk/issues/new/choose) for your question

## <a name="contributing"></a> Contributing
If you are first time contributing to any open source project, you can check these tutorials:
  * [first-contributions](https://github.com/firstcontributions/first-contributions)
  * [Step-by-step guide to contributing on GitHub](https://www.dataschool.io/how-to-contribute-on-github/)
  
You can contribute to Backk open-source project in following ways:
  * Fixing open bugs
    * [List of all open bugs](https://github.com/backk-node/backk/issues?q=is%3Aopen+is%3Aissue+label%3Abug)
    * [Lst of open bugs that are good first issues](https://github.com/backk-node/backk/issues?q=is%3Aopen+is%3Aissue+label%3Abug+label%3A%22good+first+issue%22)
  * Implement new features and enhancements
    * [List of open new feature requests](https://github.com/backk-node/backk/issues?q=is%3Aopen+is%3Aissue+label%3Aenhancement)
  * Improve documentation
    * [List of open documentation improvement requests](https://github.com/backk-node/backk/issues?q=is%3Aopen+is%3Aissue+label%3Adocumentation)
  * Answer Backk related questions
    * [Stack Overflow](https://stackoverflow.com/questions/tagged/backk?tab=Unanswered)
    * [List of unanswered questions](https://github.com/backk-node/backk/issues?q=is%3Aopen+is%3Aissue+label%3Aquestion)
  * Write unit tests
  * Refactoring
    * Proper naming of function
    * Proper naming of function arguments and function variables
    * Function is split to multiple functions if it is long
    * Typescript types are restrictive enough (avoid 'any' type)
    * Optimization
    * Readability

You can request to assign a certain issue to yourself by [creating an issue assignment request](https://github.com/backk-node/backk/issues/new/choose)

## <a name="sponsor"></a>Sponsor

## <a name="license"></a>License

MIT License

[license-badge]: https://img.shields.io/badge/license-MIT-green
[license]: https://github.com/backk-node/backk/blob/master/LICENSE
[version-badge]: https://img.shields.io/npm/v/backk.svg?style=flat-square
[package]: https://www.npmjs.com/package/backk
[Downloads]: https://img.shields.io/npm/dm/backk
