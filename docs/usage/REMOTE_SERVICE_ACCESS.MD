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

`callRemoteService` accepts fifth argument where HTTP method can be specified, default is POST.


#### <a name="makehttprequest"></a> Call Backk Remote Services

### <a name="ssynchronous"></a> Accessing Remote Services Asynchronously

#### <a name="sendtokafka"></a> Send to Remote Backk Service via Kafka
