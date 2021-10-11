[![version][version-badge]][package]
[![Downloads][downloads]][package]
[![MIT License][license-badge]][license]

<h1 align="center">Backk<br/></h1>
<h2 align="center">Node.js framework for creating secure cloud-native microservices for Kubernetes in Typescript</h2>
<h3 align="center">An task-oriented replacement for REST, GraphQ and RPC</h3>
<h4 align="center"><i>:construction_worker: :building_construction: Backk is currently in alpha phase</i></h4>

## Table of Contents

- [Features](#features)
- [Prerequisites](docs/PREREQUISITES.MD)
- [Get Started](docs/GET_STARTED.MD)
- [Sample Microservice](#sample-microservice)
- [Usage Documentation](docs/USAGE_DOCUMENTATION.MD)
- [API Documentation](docs/API_DOCUMENTATION.MD)
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

## <a name="example-microservice"></a> Example Microservice

If you want to dive right into the deep end, check out the Backk example microservice [here.](https://github.com/backk-node/backk-example-project)

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
