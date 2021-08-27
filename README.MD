[![version][version-badge]][package]
[![Downloads][Downloads]][package]
[![MIT License][license-badge]][license]


<h1 align="center">Backk<br/></h1>
<h2 align="center">Node.js framework for creating secure cloud-native microservices for Kubernetes in Typescript</h2>
<h3 align="center">An RPC style replacement for REST and GraphQL</h3>
<h4 align="center"><i>:construction_worker: :building_construction: Backk is currently in alpha phase</i></h4>

## Table of Contents

- [Features](#features)
- [Get Started](#get-started)
- [Sample Microservice](#sample-microservice)
- [Usage Documentation](#usage-documentation)
- [API Documentation](#api-documentation)
  - [AbstractDataStore](#api-documentation-abstractdatastore)
- [Feedback](#feedback)
- [Contributing](#contributing)
- [Contributors](#contributors)
- [Sponsors](#sponsors)
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

## <a name="get-started"></a> Get Started
Follow the below steps: (In the future, there will be [backk-cli](https://github.com/backk-node/backk-cli) available, which can be used to generate a Backk project based on a set of questions)

1. Clone [Backk starter project](https://github.com/backk-node/backk-starter)
   ```
   git clone git@github.com:backk-node/backk-starter.git <your-microservice-name>
   ```
2. Complete all 3 TODOs in *src/main.ts* and *src/MyMicroservice.ts* files
3. Update your microservice name to *package.json* and change the name *src/MyMicroservice.ts* to reflect your microservice name
4. Remove unused data stores:
    * If you are using MongoDB, remove
        * *src/datastores/mySqlDataStore.ts*
        * *src/datastores/postgreSqlDataStore.ts*
    * If you are using MySQL/MariaDB or MySQL compatible database, remove
        * *src/datastores/mongoDbDataStore.ts*
        * *src/datastores/postgreSqlDataStore.ts*
    * If you are using PostgreSQL or PostgreSQL compatible database, remove
        * *src/datastores/mySqlDataStore.ts*
        *  *src/datastores/mongoDbDataStore.ts*
5. Check that the environment variable values in the *.env* file are correct for your development environment
    * If you are using MongoDB, check
        * MONGO_DB_URI
    * If you are using MySQL/MariaDB or MySQL compatible database, check
        * MYSQL_HOST
        * MYSQL_USER
        * MYSQL_PASSWORD
    * If you are using PostgreSQL or PostgreSQL compatible database, check
        * POSTGRESQL_HOST
        * POSTGRESQL_USER
        * POSTGRESQL_PASSWORD
    * If you are using Kafka, check
        * KAFKA_SERVER
    * if you are using Redis, check
        * REDIS_SERVER
6. OPTIONAL STEP: Remove unnecessary dependencies from *package.json* file
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
    * If you are using PostgreSQL or PostgreSQL compatible database, remove following
      ```
      "@opentelemetry/plugin-mongodb": "0.11.0",
      "@opentelemetry/plugin-mysql": "0.11.0",
      "mongodb": "^3.6.6",
      "mysql2": "2.2.5",
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
    ```

## <a name="sample-microservice"></a> Sample Microservice
If you want to dive right into the deep end, check out the sample Backk microservice [here](https://github.com/backk-node/backk-example-project)

## <a name="usage-documentation"></a> Usage Documentation

## <a name="feedback"></a> Feedback

## <a name="contributing"></a> Contributing

## <a name="contributors"></a> Contributors

## <a name="license"></a>License

MIT License

[license-badge]: https://img.shields.io/badge/license-MIT-green
[license]: https://github.com/backk-node/backk/blob/master/LICENSE
[version-badge]: https://img.shields.io/npm/v/backk.svg?style=flat-square
[package]: https://www.npmjs.com/package/backk
[Downloads]: https://img.shields.io/npm/dm/backk
