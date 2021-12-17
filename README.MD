[![version][version-badge]][package]
[![Downloads][downloads]][package]
[![MIT License][license-badge]][license]

<h1 align="center">Backk<br/></h1>
<h2 align="center">Backends for Kubernetes</h2>
<h2 align="center">A Node.js framework for creating security-first cloud-native microservices for Kubernetes in Typescript</h2>
<h3 align="center">A task-oriented replacement for REST, GraphQL and RPC</h3>
<h4 align="center"><i>:construction_worker: :building_construction: Backk is currently in alpha phase</i></h4>

## Table of Contents

- [Features](#features)
- [How Backk Works?](#howbackkworks)
- [Prerequisites](docs/PREREQUISITES.MD)
- [Get Started](docs/GET_STARTED.MD)
- [Example Backk Microservice](#example-backk-microservice)
- [Usage Documentation](docs/USAGE_DOCUMENTATION.MD)
- [API Documentation](docs/API_DOCUMENTATION.MD)
- [Security Features](docs/SECURITY_FEATURES.MD)
- [OWASP TOP 10 Checklist](docs/OWASP_TOP_TEN_CHECKLIST.MD)
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
  - HTTP/1.1 or HTTP2
  - [Apache Kafka](https://kafka.apache.org/)
  - [Redis](https://redis.io/)
- Write your microservices using Typescript and plain functions that are called by remote clients
  - No need for learning any technology like REST, GraphQL or gRPC
  - Can be used both for resource and RPC style microservices
  - Backk does not really care if your microservice is really a microservice or more like a mini-service, macro-service or monolith.
- Supports subscription endpoints using Server Sent Events (SSE) in HTTP/1.1 and HTTP/2
- Supports multiple databases
  - [PostgreSQL](https://www.postgresql.org/)
  - [MySQL](https://www.mysql.com/)
  - [MongoDB](https://www.mongodb.com/)
  - [MariaDB](https://mariadb.org/)
  - [Vitess](https://vitess.io/) (MySQL compatible)
  - [YugabyteDB](https://www.yugabyte.com/) (PostgreSQL compatible)
  - [CockroachDB](https://www.cockroachlabs.com/) (PostgreSQL compatible)
- ORM (Object-relational mapper)
  - Entities
  - Comprehensive set of validations for all data types (number, string, Date, Arrays)
  - Drastically simplifies the definition of DTOs or totally removes the need for DTOs
- Automatic database schema generation
- Security
  - Builds distro-less non-root Docker images 
  - OAuth 2.0 Authorization support
  - Captcha verification support
  - Automatic password hashing using Argon2 algorithm
  - Automatic PII encryption/decryption
  - Mandatory validation using decorators is required for entity properties
    - e.g. string fields must have a maximum length validation and numbers must have minimum and maximum value validation
- Supports a response cache using Redis
- Automatic microservice documentation generation
  - [TypeDoc](https://typedoc.org/)
- Automatic microservice metadata/specification generation
  - [OpenAPI v3](https://swagger.io/docs/specification/about/)
  - Backk custom format that contains additional info compared to OpenAPI v3 spec
- Metadata endpoints can be called to retrieve microservice metadata for dynamic clients
- Automatic microservice integration test generation for [Postman](https://www.postman.com/) and [Newman](https://www.npmjs.com/package/newman)
- Automatic client code generation for Kubernetes cluster internal and web frontend clients
- Built-in Observability
  - Distributed tracing using OpenTelemetry API (Jaeger)
  - Log file format conforming to Open Telemetry specification
  - Metrics collection using OpenTelemetry API (Prometheus)
- Startup functions which are executed once on microservice startup
- Scheduled functions
  - Scheduled as per client request
  - Cron jobs
- Built-in Kubernetes Liveness, Readiness and Startup probes support
- Ready-made Dockerfiles
- Ready-made Docker Compose file setting up an integration testing environment
- Ready-made Helm templates for Kubernetes deployment
- Ready-made CI pipelines (currently only Github workflow)

## <a name="howbackkworks"></a> How Backk Works?
Backk microservices are written using Node.js and Typescript. A Backk microservice consists of one or more services classes with their dedicated purpose.
Each service class can contain one or more service functions (class methods) that implement the service functionality.
Each service function can have zero or exactly one parameter of JavaScript Class type. 
Service function returns a value, which can be `null`, a JavaScript value that can be converted to JSON or error.

Synchronously, Backk microservice can be accessed via HTTP. By default, each service function in the Backk microservice is accessible via HTTP POST method.
But it is possible to configure to access service functions via HTTP GET method.

Asynchronously, Backk microservices can be accessed via Kafka and/or Redis. In case of Kafka, Backk microservice reads messages
from a topic named after the microservice and message key tells the service function to execute and message value is the argument for the service function.
In case of Redis, Backk microservice uses a list named after the microservice and pops service function calls from the list.

It is possible to simultaneously access the Backk microservice both synchronously and asynchronously using any combinations of all the three communication methods: HTTP, Kafka and Redis

Let's have a short example to showcase accessing Backk microservice over HTTP.

Our microservice consist of one service `SalesItemService` that is for creating sales items and getting the created sales items, 
and it is using a MySQL database as a persistent data store.

Let's create the microservice implementation class:

MicroserviceImpl.ts
```ts
import { Microservice, MySqlDataStore } from 'backk';

const dataStore = new MySqlDataStore();

export default class MicroserviceImpl extends Microservice {
  private readonly salesItemService = new SalesItemServiceImpl(dataStore);
  // If you had other services in you microservice, you would instantiate them here

  constructor() {
    super(dataStore);
  }
}
```

Let's create the interface of the service:

SalesItemService.ts
```ts
import { Many, One, PromiseErrorOr, Service } from 'backk';
import SalesItem from './types/entities/SalesItem';

export default class SalesItemService implements Service {
  createSalesItem(salesItem: SalesItem): PromiseErrorOr<One<SalesItem>>;
  getSalesItems(): PromiseErrorOr<Many<SalesItem>>;
}
```

Let's create the implementation class of the service:

SalesItemServiceImpl.ts
```ts
import { DataStore, CrudEntityService, Many, One, PromiseErrorOr } from 'backk';
import { SalesItemService } from './SalesItemService';
import SalesItem from './types/entities/SalesItem';

export default class SalesItemServiceImpl extends CrudEntityService implements SalesItemService {
  constructor(dataStore: DataStore) {
    super({}, dataStore);
  }
  
  createSalesItem(salesItem: SalesItem): PromiseErrorOr<One<SalesItem>> {
    this.dataStore.createEntity(SalesItem, salesItem);
  }
  
  getSalesItems(): PromiseErrorOr<Many<SalesItem>> {
    this.dataStore.getAllEntities(SalesItem);
  }
}
```

Let's create the `SalesItem` entity class:

SalesItem.ts
```ts
import { _Id, Entity, IsAscii, IsFloat, ReadWrite } from 'backk';

@Entity()
export default class SalesItem extends _Id {
  @IsAscii()
  @Length(1, 128)
  @ReadWrite()
  name!: string;
  
  @IsFloat()
  @MinMax(0, Number.MAX_VALUE)
  @ReadWrite()
  price!: number;
}
```

Now we can create an entity with an HTTP POST call:
```
POST /salesItemService.createSalesItem
Content-Type: application/json

{
  "name": "Sales item 1",
  "price": 49.95
}
```

And we get a response containing the created entity with `_id` assigned:
```
HTTP/1.1 200 OK
Content-Type: application/json

{
  "metadata": {}
  "data": {
    "_id": "1",
    "name": "Sales item 1",
    "price": 49.95
  }
}
```

Let's create another sales item:
```
POST /salesItemService.createSalesItem
Content-Type: application/json

{
  "name": "Sales item 2",
  "price": 89.95
}
```

And then we can get the created entities with an HTTP POST call to `salesItemService.getSalesItems`:
```
POST /salesItemService.getSalesItems
```

And the response will be:
```
HTTP/1.1 200 OK
Content-Type: application/json

{
  metadata: {}
  data: [
    {
      "_id": "1",
      "name": "Sales item 1",
      "price": 49.95
    },
    {
      "_id": "2",
      "name": "Sales item 2",
      "price": 89.95
    }
  ]
}
```

## <a name="example-backk-microservice"></a> Example Backk Microservice

If you want to dive right into the deep end, check out the [Backk example microservice.](https://github.com/backk-node/backk-example-microservice)

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
