## Remote Service Access

- [callRemoteService](#callremoteservice)
- [makeHttpRequest](#makehttprequest)
- [sendToRemoteService](#sendtoremoteservice)
- [sendToRemoteServiceInsideTransaction](#sendtoremoteserviceinsidetransaction)

### <a name="callremoteservice"></a> callRemoteService
```ts
async function callRemoteService(
  microserviceName: string,
  serviceFunctionName: string,
  serviceFunctionArgument?: object,
  microserviceNamespace = process.env.SERVICE_NAMESPACE,
  options?: HttpRequestOptions
): PromiseErrorOr<object | null>

interface HttpRequestOptions {
  httpMethod?: 'GET' | 'POST';
}
```

Calls a remote Backk microservice `microserviceName` and executes remote service function `serviceFunctionName` with argument `serviceFunctionArgument`.
The remote Backk microservice Kubernetes namespace is defined using `microserviceNamespace` argument.
The HTTP method used can be defined in `options`. By default, HTTP POST method is used.

Returns an object, null or error.

### <a name="makehttprequest"></a> makeHttpRequest
```ts
async function makeHttpRequest(
  requestUrl: string,
  requestBodyObject?: object,
  options?: HttpRequestOptions
): PromiseErrorOr<object | null>

interface HttpRequestOptions {
  httpMethod?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
}
```

Makes an HTTP or HTTPS request to URL `requestUrl` with given `requestBodyObject`. Request content type is `application/json`.
Authorization header is automatically added to the made HTTP request.
The request is made using HTTP GET method by default. The method can be changed by supplying `options.httpMethod`.

### <a name="sentoremoteservice"></a> sendToRemoteService

```ts
import { CommunicationMethod } from "./sendToRemoteService";

async function sendToRemoteService(
  communicationMethod: 'kafka' | 'redis',
  microserviceName: string,
  serviceFunctionName: string,
  serviceFunctionArgument: object,
  microserviceNamespace = process.env.SERVICE_NAMESPACE,
  server?: string,
  sendResponseTo?: ResponseSendToSpec,
  options?: SendToOptions
): PromiseErrorOr<null>

interface ResponseSendToSpec {
  communicationMethod: CommunicationMethod;
  microserviceName: string;
  microserviceNamespace: string | undefined;
  serviceFunctionName: string;
  server: string;
}

type CommunicationMethod = 'http' | 'kafka' | 'redis'

interface SendToOptions {
  compressionType?: CompressionTypes;
  sendAcknowledgementType?: SendAcknowledgementType;
}

enum CompressionTypes {
  None = 0, // Default
  GZIP = 1,
  Snappy = 2,
  LZ4 = 3,
  ZSTD = 4,
}

enum SendAcknowledgementType {
  NONE,
  LEADER_ONLY,
  ALL_REPLICAS = -1 // Default
}
```
Sends a request to a remote Backk microservice `microserviceName`'s service function `serviceFunctionName` via a message queue as denoted by `communicationMethod` (Kafka or Redis).

The remote Backk microservice Kubernetes namespace is defined using `microserviceNamespace` argument.
`server` defines the Kafka/Redis server host and port in form of <hostname>:<port>. By default, the server
defined with following environment variables: `KAFKA_HOST`, `KAFKA_PORT`, `REDIS_HOST` and `REDIS_PORT`.
`sendResponseTo` defines the where remote service sends its response to the request.
`options` apply only to sending a message to remote service via Kafka.

Returns null or error.

### <a name="sentoremoteserviceinsidetransaction"></a> sendToRemoteServiceInsideTransaction
```ts
async function sendToRemoteServiceInsideTransaction(sends: RemoteCallOrSendToSpec[]): PromiseErrorOr<null>

interface RemoteCallOrSendToSpec {
  communicationMethod: 'kafka';
  microserviceName: string;
  serviceFunctionName: string;
  serviceFunctionArgument: object;
  microserviceNamespace?: string;
  server?: string;
  sendResponseTo?: ResponseSendToSpec;
  options?: SendToOptions;
}

interface ResponseSendToSpec {
  communicationMethod: CommunicationMethod;
  microserviceName: string;
  microserviceNamespace: string | undefined;
  serviceFunctionName: string;
  server: string;
}

type CommunicationMethod = 'http' | 'kafka' | 'redis'

interface SendToOptions {
  compressionType?: CompressionTypes;
  sendAcknowledgementType?: SendAcknowledgementType;
}

enum CompressionTypes {
  None = 0, // Default
  GZIP = 1,
  Snappy = 2,
  LZ4 = 3,
  ZSTD = 4,
}

enum SendAcknowledgementType {
  NONE,
  LEADER_ONLY,
  ALL_REPLICAS = -1 // Default
}
```

Sends multiple requests to a remote services as specified in `sends` via a message queue (Kafka) inside a transaction.

`server` defines the Kafka server host and port in form of <hostname>:<port>. By default, the server
defined with following environment variables: `KAFKA_HOST`, `KAFKA_PORT`.
`sendResponseTo` defines the  where remote service sends its response to the request.
`options` defines compression and send acknowledgements type.

Returns null or error.
