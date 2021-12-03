## Accessing Remote Services

- [Accessing Remote Services Synchronously](#synchronous)
  - [Declarative Fetch of Sub-Entities From Backk Remote Services](#fetchfromremoteservice)
  - [Call Backk Remote Service](#callremoteservice)
  - [Make HTTP Requests](#makehttprequest)
- [Accessing Remote Services Asynchronously](#asynchronous)
  - [Send to Remote Backk Service via Kafka](#sendtokafka)
  - [Send to Remote Backk Service via Redis](#sendtoredis)
  - [Send Multiple Request to Remote Backk Services via Kafka inside Transaction](#sendtokafkainsidetransaction)

### <a name="synchronous"></a> Accessing Remote Services Synchronously
There are three different ways to synchronously access remote services from your current Backk microservice.
First way is to a declarative fetch of sub-entities from another Backk microservice.
The second way is to call another Backk microservice to synchronously fetch data.
Third way is to make a generic HTTP request to any HTTP based service.

#### <a name="fetchfromremoteservice"></a> Declarative Fetch of Sub-Entities From Backk Remote Services

In the below example, Backk microservice `user-account-service` has an entity named `UserAccoount`.
When a `UserAccount` entity is fetched from data store at the same time also user's own sales items are fetched
automatically from a remote Backk microservice named `sales-item-service`, where service function named
`salesItemService.getUsersSalesItem` is called with argument containing `userAccountId`.

The first argument of `@FetchFromRemoteService` decorator is the name of the remote Backk microservice.
The second argument is the name of the service function to be called.
The third argument is service function argument builder that is a function which receives current service
function call argument and response as arguments and then returns the argument to be sent to remote service function.

Entity properties annotated with `@FetchFromRemoteService` are always implicitly read-only properties.

In the below example, user's own sales items are fetched from remote `sales-item-service` microservice using service function
`salesItemService.getUsersSalesItems`. `{ userAccountId: <your user account id> }` will sent as a argument for the remote service function call. For example, if you request service function `userAccountService.getUserAccount`,
you will get your own sales items automatically fetched from the remote microservice. 

```ts
import { FetchFromRemoteService, ReadOnly } from 'backk';

class UserAccount extends BaseUserAccount {
  @FetchFromRemoteService('sales-item-service', 'salesItemService.getUsersSalesItems', (arg, response) => ({
    userAccountId: response._id
  }))
  ownSalesItems: any[];
}
```

`@FetchFromRemoteService` accepts fourth argument which is the Kubernetes namespace of the remote microservice.
By default, it is the same as microservice calling the remote microservice. 

`@FetchFromRemoteService` accepts fifth argument where HTTP method can be specified, default is POST.

#### <a name="callremoteservice"></a> Call Backk Remote Services
Backk microservice can easily call service functions in another Backk microservice using `callRemoteService` function.
The below example calls service function `salesItemService.getUsersSalesItems` in Backk microservice `sales-item-service`,
giving `userAccountId` as service function argument.

```ts
import { callRemoteService } from 'backk';

callRemoteService(
  'sales-item-service',
  'salesItemService.getUsersSalesItems',
  {
    userAccountId
  }
);
```

`callRemoteService` accepts fourth argument which is the Kubernetes namespace of the remote microservice.
By default, it is the same as microservice calling the remote microservice.

`callRemoteService` accepts fifth argument where HTTP request options can be specified:

```ts
interface HttpRequestOptions {
  httpMethod?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  httpVersion?: 1 | 2;
  tls?: {
    ca?: string | Buffer | Array<string | Buffer>;
    cert?: string | Buffer | Array<string | Buffer>;
    key?: string | Buffer | Array<Buffer | KeyObject>;
  };
}
```

#### <a name="makehttprequest"></a> Make HTTP Requests
Accessing non-Backk microservices and HTTP endpoints from Backk microservice is easy using `makeHttpRequest` function.
`makeHttpRequest` will accept `requestUrl` argument and a JavaScript object as request body. The HTTP request
is always made with content type `application/json`. Current request´s authorization header is added to the new request.
Making HTTPS request is possible, but you should not use HTTPS, but instead configure Kubernetes service mesh mTLS 
between microservices and Kubernetes cluster external services.

```ts
function makeHttpRequest(
  requestUrl: string,
  requestBodyObject?: object,
  options?: HttpRequestOptions
): PromiseErrorOr<object | null>

interface HttpRequestOptions {
  httpMethod?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  httpVersion?: 1 | 2;
  tls?: {
    ca?: string | Buffer | Array<string | Buffer>;
    cert?: string | Buffer | Array<string | Buffer>;
    key?: string | Buffer | Array<Buffer | KeyObject>;
  };
}
```

### <a name="synchronous"></a> Accessing Remote Services Asynchronously
There are three different ways to access asynchronously remote Backk services from your Backk microservice.

First way is to access them by sending a remote service function call request to Kafka, 
the second way is to access them by sending a remote service function call request to Redis.

The third way is to access multiple remote Backk services via Kafka inside a transaction.

#### <a name="sendtokafka"></a> Send to Remote Backk Service via Kafka
Sending service function call request to a remote Backk microservice can be achieved with a call to `sendToRemoteService` function.
In the below example a service function call request for service function `refundService.refundOrder` in
Backk microservice named `refund-service` is sent to Kafka with service function argument containing the `orderId`

```ts
sendToRemoteService('kafka', 'refund-service', `refundService.refundOrder`, { orderId: _id })
```

As the fifth argument to `sendToRemoteService` function, the Kubernetes namespace of target remote Backk microservice
can be specified. The default value is the same namespace as for current microservice.

The sixth argument of `sendToRemoteService` function specifies the Kafka server in the form of <hostname>:<port>
By default, the Kafka server info is extracted from environment variables `KAFKA_HOST` and `KAFKA_PORT`.

The seventh argument of `sendToRemoteService` function specifies the remote service function request for the
response of the async remote service function call.

#### <a name="sendtoredis"></a> Send to Remote Backk Service via Redis
Sending service function call request to a remote Backk microservice can be achieved with a call to `sendToRemoteService` function.
In the below example a service function call request for service function `refundService.refundOrder` in
Backk microservice named `refund-service` is sent to Redis with service function argument containing the `orderId`

```ts
sendToRemoteService('redis', 'refund-service', `refundService.refundOrder`, { orderId: _id })
```

As the fifth argument to `sendToRemoteService` function, the Kubernetes namespace of target remote Backk microservice
can be specified. The default value is the same namespace as for current microservice.

The sixth argument of `sendToRemoteService` function specifies the Redis server in the form of <hostname>:<port>
By default, the Redis server info is extracted from environment variables `REDIS_HOST` and `REDIS_PORT`.

The seventh argument of `sendToRemoteService` function specifies the remote service function request for the
response of the async remote service function call.

#### <a name="sendtokafkainsidetransaction"></a> Send Multiple Request to Remote Backk Services via Kafka inside Transaction
This is for sending multiple remote service function call requests simultaneously inside transaction to Kafka.
All the remote service function call requests must happen to the same Kafka server.
Transactions are not supported by Redis.

```ts
function sendToRemoteServiceInsideTransaction(sends: RemoteCallOrSendToSpec[]);

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
```
