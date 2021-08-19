[![version][version-badge]][package]
[![Downloads][Downloads]][package]
[![MIT License][license-badge]][license]


<h1 align="center">Backk<br/></h1>
<h3 align="center">Node.js framework for creating secure cloud-native microservices for Kubernetes in Typescript</h3>
<h4 align="center">Backk is currently in alpha phase</h4>

## Table of Contents

- [Features](#features)
- [Install](#install)
- [Sample Microservice](#sample-microservice)
- [Usage Documentation](#usage-documentation)
- [API Documentation](#api-documentation)
  - [AbstractDataStore](#api-documentation-abstractdatastore)
- [Feedback](#feedback)
- [Contributing](#contributing)
- [Contributors](#contributors)
- [Sponsors](#sponsors)
- [License](#license)

## <a href="install"></a> Features
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

## <a href="install"></a> Install

    npm install --save backk

## <a href="sample-microservice"></a> Sample Microservice

## <a href="usage-documentation"></a> Usage Documentation

## <a href="feedback"></a> Feedback

## <a href="contributing"></a> Contributing

## <a href="contributors"></a> Contributors

## <a href="license"></a>License

MIT License

[license-badge]: https://img.shields.io/badge/license-MIT-green
[license]: https://github.com/backk-node/backk/blob/master/LICENSE
[version-badge]: https://img.shields.io/npm/v/backk.svg?style=flat-square
[package]: https://www.npmjs.com/package/backk
[Downloads]: https://img.shields.io/npm/dm/backk
