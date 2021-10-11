## Remote Service Access

- [callRemoteService](#callremoteservice)
- [makeHttpRequest](#makehttprequest)
- [sendToRemoteService](#sendtoremoteservice)
- [sendToRemoteServiceInsideTransaction](#sendtoremoteserviceinsidetransaction)

### <a name="callremoteservice"></a> callRemoteService
```ts
async function callRemoteService(
  remoteServiceFunctionUrl: string,
  serviceFunctionArgument?: object,
  options?: HttpRequestOptions
): PromiseErrorOr<object | null>

interface HttpRequestOptions {
  httpMethod?: 'GET' | 'POST';
}
```

Calls a remote Backk service at URL `remoteServiceFunctionUrl` with argument `serviceFunctionArgument`.
By default HTTP POST method is used.

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
The request is made using HTTP GET method by default. The method can be changed by supplying `options.httpMethod`.

### <a name="sentoremoteservice"></a> sendToRemoteService
```ts
async function sendToRemoteService(
  remoteServiceFunctionUrl: string,
  serviceFunctionArgument: object,
  responseUrl?: string,
  options?: SendToOptions
): PromiseErrorOr<null>

interface SendToOptions {
  compressionType?: CompressionTypes;
  sendAcknowledgementType?: SendAcknowledgementType;
}

enum CompressionTypes {
  None = 0,
  GZIP = 1,
  Snappy = 2,
  LZ4 = 3,
  ZSTD = 4,
}

enum SendAcknowledgementType {
  NONE,
  LEADER_ONLY,
  ALL_REPLICAS = -1
}
```

Sends a request to a remote service via a message queue (Kafka or Redis).
To send a request to a remote service via Kafka, following format `remoteServiceFunctionUrl` must be used:

```
kafka://<kafka-host>:<kafka-port>/<microservice-name>.<microservice-namespace>/<serviceFunctionName>

For example:
kafka://kafka.default.svc.cluster.local:9092/notificationservice.default/emailNotificationService.sendEmail
```

To send a request to a remote service via Redis, following format `remoteServiceFunctionUrl` must be used:
```
redis://<redis-host>:<redis-port>/<microservice-name>.<microservice-namespace>/<serviceFunctionName>

For example:
redis://redis.default.svc.cluster.local:6379/notificationservice.default/emailNotificationService.sendEmail
```

`responseUrl` defines the URL where remote service sends its response to the request.
`options` apply only to sending a message to remote service via Kafka.

Returns null or error.

### <a name="sentoremoteserviceinsidetransaction"></a> sendToRemoteServiceInsideTransaction
```ts
async function sendToRemoteServiceInsideTransaction(sends: CallOrSendToSpec[]): PromiseErrorOr<null>

interface CallOrSendToSpec {
  remoteServiceFunctionUrl: string;
  serviceFunctionArgument?: object;
  responseUrl?: string;
  options?: SendToOptions;
}

interface SendToOptions {
  compressionType?: CompressionTypes;
  sendAcknowledgementType?: SendAcknowledgementType;
}

enum CompressionTypes {
  None = 0,
  GZIP = 1,
  Snappy = 2,
  LZ4 = 3,
  ZSTD = 4,
}

enum SendAcknowledgementType {
  NONE,
  LEADER_ONLY,
  ALL_REPLICAS = -1
}
```

Sends multiple requests to a remote service(s) via a message queue (Kafka).
To send a request to a remote service via Kafka, following format `remoteServiceFunctionUrl` must be used:

```
kafka://<kafka-host>:<kafka-port>/<microservice-name>.<microservice-namespace>/<serviceFunctionName>

For example:
kafka://kafka.default.svc.cluster.local:9092/notificationservice.default/emailNotificationService.sendEmail
```

`responseUrl` defines the URL where remote service sends its response to the request.

Returns null or error.
