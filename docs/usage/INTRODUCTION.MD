## Introduction

Here we are going to build a Backk microservice for handling sales items to showcase main Backk features.
For getting your Backk development environment set up, please complete the [Prerequisites](../PREREQUISITES.MD) and then follow instructions in [Get Started](../GET_STARTED.MD) section to complete the development environment setup.

### Glossary

| Term                          | Definition                                                                                                                                                                                                                                                                                                                                                                                                                    |
| ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --- |
| Client                        | Application using the microservice. Client can be e.g. web app or another microservice                                                                                                                                                                                                                                                                                                                                        |
| Entity                        | A class that defines a database table structure for storing entities. Entity instances can be given as service function arguments and returned from service functions                                                                                                                                                                                                                                                         |
| Root Entity                   | Entity class that has no parent entity. Root entity class must have an `_id` property. It should not have an `id` property, because only sub-entities have `id` property                                                                                                                                                                                                                                                      |     |
| Sub-Entity                    | Entity class that has a parent entity. Sub-entity class must have an `id` property. It should not have an `_id` property, because only root entities has `_id` property.                                                                                                                                                                                                                                                      |
| Microservice                  | Node.js Backk application running in pods in Kubernetes. Backk does not really care if you microservice is a real microservice or not. It can also be a mini-service or monolith, it is up to you, but in this documentation we always use a term 'microservice'.                                                                                                                                                                                                                                                                                                                                                                       |
| Microservice namespace        | Kubernetes namespace where microservice is running                                                                                                                                                                                                                                                                                                                                                                            |
| Namespaced microservice name  | Microservice name and Kubernetes namespace in format: <microservice-name>.<namespace>, for example: notification-service.platform
| Service                       | A constituent of Backk microservice. Backk microservice consists of one or more services. Service consist of an interface and at least one implementation class. For example: `SalesItemService` interface and `SalesItemServiceImpl` class. Service interface should declare service functions that service class(es) implement.                                                                                             |
| Service function              | A method in a service interface/class. Service functions can be called by Backk clients. Service function is called by its name: `service-name.function-name`. Service name is the same as service interface name with lower case first letter. If there is `SalesItemService` interface, service name should be `salesItemService`. Function name is the name of the method. For example: `salesItemService.createSalesItem` |
| Service function argument     | An instance of JavaScript class that is given as an argument to a service function. When client calls a service function over HTTP, argument is given in HTTP request body in JSON                                                                                                                                                                                                                                               |
| Service function return value | Should be of type `PromiseErrorOr<T>`, where T can be `null` or Javascript object. When clients calls a service function over HTTP, return value (if not `null`) is returned in HTTP response body in JSON                                                                                                                                                                                                                    |

### Create Your First Service

Backk microservice consist of one or more services. You should place your services under `src/services` directory in the Backk microservice project.
It is recommended to have a dedicated directory for each service. If multiple services share common code, it
should be placed in a separate shared directory, for example `src/services/common` or `src/services/shared`.

Let's create a `SalesItemService` service for handling sales items. The service files should be placed in
`src/services/salesitem` directory in Backk microservice project. First, you create a service interface extending `Service` interface.
Second, you create a class to implement the interface. Your class should extend from [BaseService](../api/BASE_SERVICES.MD#baseservice)
or [CrudEntityService](../api/BASE_SERVICES.MD#crudentityservice). In this case, when we are performing CRUD operations on a resource (or entity) it is natural
to use `CrudEntityService` as base service implementation. You should name interfaces so that they end with `Service` and name classes so that they end with `ServiceImpl`

In the `SalesItemService` interface, we declare the service functions that we want to later implement.
Each service function can have either zero or exactly one argument, and the argument must be of JavaScript class type.

Each service function should return a value of type `PromiseErrorOr<T>`. If your service function does not return a value,
its return value should be `PromiseErrorOr<null>`. If your service function returns one entity, its return type should
`PromiseErrorOr<One<T>>`, where `T` is type of the entity. If you service function returns multiple entities, its return
type should `PromiseErrorOr<Many<T>>`, where `T` is type of the entity. Any service function can always return an error.
`PromiseErrorOr<T>` is a promise of 2-tuple type where the first value of the tuple is the service function return value `T`, or in case of error, it is
null or undefined. The second value of the tuple is `BackkError` in case of service function execution failure or null or undefined on success.

Here are the type definitions for `PromiseErrorOr<T>`, `BackkError`, `Many` and `One`:

```ts
type PromiseErrorOr<T> = Promise<[T | null | undefined, BackkError | null | undefined]>;

type BackkError = {
  statusCode: number;
  message: string;
  errorCode?: string;
  stackTrace?: string;
};

type Many<T> = {
  metadata: {
    currentPageTokens: CurrentPageToken[] | undefined;
    [key: string]: any;
  };
  data: T[];
};

type One<T> = {
  metadata: {
    currentPageTokens: CurrentPageToken[] | undefined;
    [key: string]: any;
  };
  data: T;
};
```

Your service function can return custom metadata by adding custom properties to `metadata` object of `One<T>` and `Many<T>`.

Backk generates automatically integration tests for your service. If you want to benefit from them, it is important in which order you
define the service functions. They should be defined in the same order in which they should be tested.

In `src/services/salesitem` directory,
create an `SalesItemService` interface for your service by extending the `Service` interface:

SalesItemService.ts

```ts
import { _Id, Many, One, PromiseErrorOr, Service } from 'backk';
import GetSalesItemsArg from './types/args/GetSalesItemsArg';
import SalesItem from './types/entities/SalesItem';

export interface SalesItemService extends Service {
  deleteAllSalesItems(): PromiseErrorOr<null>;
  createSalesItem(arg: SalesItem): PromiseErrorOr<One<SalesItem>>;
  getSalesItems(arg: GetSalesItemsArg): PromiseErrorOr<Many<SalesItem>>;
  getSalesItem(arg: _Id): PromiseErrorOr<One<SalesItem>>;
  updateSalesItem(arg: SalesItem): PromiseErrorOr<null>;
  deleteSalesItem(arg: _Id): PromiseErrorOr<null>;
}
```

### Create Service Implementation Class

Next you should provide the implementation for the service interface. Let's create a `SalesItemServiceImpl`
class in `src/services/salesitem` directory. Our implementation class should extend from `CrudResourceService` and
it should also implement the interface just created.

SalesItemServiceImpl.ts

```ts
import { CrudEntityService, DataStore } from 'backk';
import SalesItemService from './SalesItemService';

export default class SalesItemServiceImpl extends CrudEntityService implements SalesItemService {
  constructor(dataStore: DataStore) {
    super({}, dataStore);
  }
}
```

You need supply `dataStore` for your service, if it is using a database, otherwise you can use an instance of `NullDataStore`.

NOTE!
Your microservice can use only one data store.
If you service requires multiple data store, your service is not probably a microservice. You should then split
your service into smaller pieces, so that each microservice requires only one data store to operate on.

For the `CrudEntityService` class constructor, you need to give two parameters:
- map of error definitions (or an empty object if the service does not raise any errors specific to business logic in your service functions)
- dataStore

### Add Service to Microservice

Services of the microservice should be instantiated in `MicroserviceImpl` class that extends `Microservice` class.
Service instances should be stored as private read-only fields in the `MicroserviceImpl` class. You should name the fields according
to the service interface name, for example: `SalesItemService` interface => `salesItemService` field.

Add your service to `src/microservice.ts`:

```ts
import { Microservice } from 'backk';
import SalesItemServiceImpl from './services/salesitem/SalesItemServiceImpl';

class MicroserviceImpl extends Microservice {
  private readonly salesItemService = new SalesItemServiceImpl();
}
```

### Create Sales Item Entity

We need to create the Sales item entity class so that we can use it in our sales item service implementation.
Let's create `SalesItem` class in directory `src/services/salesitem/types/entities`:

SalesItem.ts

```ts
import { _Id, Entity, IsAscii, IsFloat, Length, MinMax, ReadWrite } from 'backk';

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

Entity class is a blueprint for items to be stored in the data store (database). When you create an entity
class, it needs to be annotated with `@Entity()` decorator. The name of the entity class will be the name of
the table in the database.

For each property in the entity class, you need define a validator or validators. For `string` type properties,
you need to define a string validator, for example `@IsAcii()`. If you accept any string value, you should annotate
the string property with `@IsAnyString()` decorator. Additionally, you need to define what is the maximum length of
accepted string. You can use `@MaxLength()` or `@Length()` decorator. The latter of which also defines the minimum length of
the string. Limiting the maximum length of the string is crucial to prevent possible DoS (Denial of Service) attacks.

For number type properties, you must define one of following:
`@IsInt()`, `@IsFloat` or `@IsBigInt()`.

In addition to that, you need to define the allowed range of values with
`@MinMax()` decorator. If some needed validators is missing, Backk will throw an exception.

For each property you must define the access mode of the property. The access mode defines the visibility of the
property to the clients of the microservice. The following [access mode decorators](../api/DECORATORS.MD#entity-property-decorators) are available:
- `@Private()`
- `@ReadWrite()`
- `@ReadOnly()`
- `@ReadUpdate()`
- `@WriteOnly()`
- `@CreateOnly()`
- `@UpdateOnly()`

The exclamation mark (!) after property names is needed because properties are not initialized in the class constructor.
If the exclamation mark is missing, you will get a TypeScript compiler warnings.

### Implement deleteAllSalesItems

Let´s practice Test driven development (TDD) for our first service function to showcase that Backk is ready
configured for unit testing with Jest.

First we will write our spec file to specify the functionality of the `deleteAllEntities` method:

SalesItemServiceImpl.spec.ts

```ts
import { NullDataStore } from 'backk';
import SalesItemServiceImpl from './SalesItemServiceImpl';
import SalesItem from './types/entities/SalesItem';

const dataStore = new NullDataStore();
const salesItemService = new SalesItemServiceImpl(dataStore);

describe('SalesItemService', () => {
  describe('deleteAllEntities', () => {
    it('should call the data store´s deleteAllEntities method once with SalesItem entity class as parameter and return null as result without an error', async () => {
      // GIVEN
      dataStore.deleteAllEntities = jest.fn().mockReturnValue(Promise.resolve([null, null]));

      // WHEN
      const [result, error] = await salesItemService.deleteAllEntities();

      // THEN
      expect(dataStore.deleteAllEntities).toHaveBeenCalledTimes(1);
      expect(dataStore.deleteAllEntities).toHaveBeenCalledWith(SalesItem);
      expect(result).toBeNull();
      expect(error).toBeNull();
    });
  });
});
```

`NullDataStore` should be used in unit tests, because we don't want to make real database operations.
In `dataStore` object, we mock the `deleteAllEntities<T>(EntityClass: new () => T): PromiseErrorOr<null>` method to return promise of `[null, null]` (successful operation)

Let's test our unit test by executing:

```bash
npm test
```

Test will fail because we haven't implemented the `deleteAllEntities` function in `SalesItemServiceImpl` class.
Let´s implement the function:

SalesItemServiceImpl.ts

```ts
import { AllowForTests, CrudEntityService, PromiseErrorOr } from 'backk';
import SalesItemService from './SalesItemService';
import SalesItem from './types/entities/SalesItem';

export default class SalesItemServiceImpl extends CrudEntityService implements SalesItemService {
  @AllowForTests()
  deleteAllSalesItems(): PromiseErrorOr<null> {
    return this.dataStore.deleteAllEntities(SalesItem);
  }
}
```

Now we can execute `npm test` again and make our unit test to pass.

Each Backk service function must have an authorization annotation for improved security reasons. By explicitly
requiring an authorization annotation, it makes impossible to forget such an annotation.
For the above service function, we use `@AllowForTests` decorator to indicate that this service function
can only be accessed when executing tests, it cannot be accessed by any clients at all.

There are following possible [authorization decorators](../api/DECORATORS.MD#service-function-decorators) available for use:
- `@AllowForEveryUser(isAuthenticationRequired: boolean)`
- `@AllowForEveryUserForOwnResources()`
- `@AllowForUserRoles(roles: string[])`
- `@AllowForKubeClusterInternalUse()`
- `@AllowForMicroserviceInternalUse()`
- `@AllowForTests()`

### Implement createSalesItem

SalesItemService.spec.ts

```ts
describe('SalesItemService', () => {
  describe('createSalesItem', () => {
    it('should call the data store´s createEntity method once with SalesItem class as first parameter and sales item entity as second parameter and should return the entity withour error', async () => {
      // GIVEN
      const salesItem = {
        name: 'Sales item 1',
        price: 50,
      };

      dataStore.createEntity = jest
        .fn()
        .mockReturnValue(Promise.resolve([{ metadata: {}, data: salesItem }, null]));

      // WHEN
      const [{ data: createdSalesItem }, error] = await salesItemService.createSalesItem(salesItem);

      // THEN
      expect(dataStore.createEntity).toHaveBeenCalledTimes(1);
      expect(dataStore.createEntity).toHaveBeenCalledWith(SalesItem, salesItem);
      expect(createdSalesItem).toBe(salesItem);
      expect(error).toBeNull();
    });
  });
});
```

SalesItemServiceImpl.ts

```ts
import { AllowForUserRoles, CrudEntityService, One, PromiseErrorOr } from 'backk';
import SalesItemService from './SalesItemService';
import SalesItem from './types/entities/SalesItem';

export default class SalesItemServiceImpl extends CrudEntityService implements SalesItemService {
  @AllowForUserRoles(['admin', 'salesAdmin'])
  createSalesItem(salesItem: SalesItem): PromiseErrorOr<One<SalesItem>> {
    return this.dataStore.createEntity(SalesItem, salesItem);
  }
}
```

Creating a new sales item is only allowed for logged-in users with either `admin` or `salesAdmin` role.

### Implement getSalesItem

We skip the unit test writing for the rest of the SalesItemService implementation.

```ts
import {
  AllowForEveryUser,
  CrudEntityService,
  DefaultPostQueryOperationsImpl,
  PromiseErrorOr,
  SqlFilter,
} from 'backk';
import SalesItemService from './SalesItemService';
import SalesItem from './types/entities/SalesItem';
import GetSalesItemArg from './types/args/GetSalesItemArg';

export default class SalesItemServiceImpl extends CrudEntityService implements SalesItemService {
  @AllowForEveryUser()
  getSalesItems({ nameFilter }: GetSalesItemsArg): PromiseErrorOr<Many<SalesItem>> {
    const filter = new SqlFilter('name LIKE :nameFilter', {
      nameFilter: `%${nameFilter}%`,
    });
    const postQueryOperations = new DefaultPostQueryOperationsImpl();
    return this.dataStore.getEntitiesByFilters(SalesItem, [filter], postQueryOperations, false);
  }
}
```

Service function arguments must be Javascript classes and their properties need same kind of validation as entity class properties need. This is needed to ensure
that only valid values are supplied to service function. Here is the implementation for the `GetSalesItemsArg` service function argument class:

GetSalesItemsArg.ts

```ts
import { IsAscii, MaxLength } from 'backk';

export default class GetSalesItemsArg {
  @IsAscii()
  @MaxLength(128)
  nameFilter!: string;
}
```

For data store's `getEntitiesByFilters` you need to supply `postQueryOperations`.
They are needed and used to define what fields are included in the response, how returned entities are sorted and paginated.

In this example, we are using the default post query operations provided by the class `DefaultPostQueryOperationsImpl`.
You can provide an instance of your own class matching the `PostQueryOperations` interface, or you can get this
information from the client. In the example above, one way to get that information from client is that `GetSalesItemsArg` class extends from `DefaultPostQueryOperationsImpl`
or your own class (which can extend from `DefaultPostQueryOperationsImpl`, for example).

`DefaultPostQueryOperationsImpl` is defined as follows:

```ts
class DefaultPostQueryOperationsImpl implements PostQueryOperations {
  constructor(pageNumber: number = 1, pageSize: number = 50) {
    this.paginations = [new Pagination('*', 1, pageSize)];
  }

  includeResponseFields?: string[] = [];
  excludeResponseFields?: string[] = [];
  sortBys: SortBy[] = [new SortBy('*', '_id', 'ASC'), new SortBy('*', 'id', 'ASC')];
  paginations: Pagination[];
  currentPageTokens: CurrentPageToken[] = [];
}
```

Using an instance of `DefaultPostQueryOperationsImpl` will return all entity fields (this is because empty array for `includeResponseFields` means that all fields are returned)
No fields are excluded from the response and entities and their sub-entities are sorted by `_id` or `id` fields.
The response will contain the `pageNumber` page (default is first page) of entities and their sub-entities with page size of `pageSize` (default is 50)

More information about post query operations is provided [here](../api/POST_QUERY_OPERATIONS.MD)

### Implement rest of the SalesItemService

```ts
import { _Id, AllowForEveryUser, AllowForUserRoles, CrudEntityService, PromiseErrorOr } from 'backk';
import SalesItemService from './SalesItemService';
import SalesItem from './types/entities/SalesItem';

export default class SalesItemServiceImpl extends CrudEntityService implements SalesItemService {
  @AllowForEveryUser()
  getSalesItem({ _id }: _Id): PromiseErrorOr<One<SalesItem>> {
    return this.dataStore.getEntityById(SalesItem, _id);
  }

  @AllowForUserRoles(['admin', 'salesAdmin'])
  updateSalesItem(salesItem: SalesItem): PromiseErrorOr<null> {
    return this.dataStore.updateEntity(SalesItem, salesItem);
  }

  @AllowForUserRoles(['admin', 'salesAdmin'])
  deleteSalesItem({ _id }: _Id): PromiseErrorOr<null> {
    return this.dataStore.deleteEntityById(SalesItem, _id);
  }
}
```

### Run Integration Tests with Postman

Start your created Backk microservice:

```bash
npm run start:dev
```

Wait your microservice to start. Launch Postman and import following `generated/integrationtests/integrationTestsPostmanCollection.json`
file to Postman. Now you can run the integration tests by choosing the imported collection and pressing Run button.

You can also run integrations test from the command line:

```bash
npm run integrationtest:dev
```
