## Introduction

Here we are going to build a Backk microservice for handling sales items to showcase main Backk features.
For getting your Backk development environment setup, please follow instructions in [Get Started](../GET_STARTED.MD) section.

### Create Your First Service

Backk microservice consist of one or more services. You should place your services under `src/services` directory in the Backk microservice project.
It is recommended to have a dedicated directory for each service. If multiple services share common code, it
should be placed in a separate shared directory, for example `src/services/common` or `src/services/shared`.

Let's create a `SalesItemService` service class for handling sales items. The service class file should be placed in
`src/services/salesitem` directory in Backk microservice project. You extend your service class from [BaseService](../api/BASE_SERVICES.MD#baseservice)
or [CrudEntityService](../api/BASE_SERVICES.MD#crudentityservice). In this case, when we are performing CRUD operations on a resource (or entity) it is natural
to use `CrudEntityService` as base service. 

In the `SalesItemService` class, we write the service functions that we want to implement.
Each service function can have either zero or exactly one argument, and the argument must be a JavaScript object.

Each service function should return a value of type `PromiseErrorOr<T>`. If your service function does not return a value,
its return value should be `PromiseErrorOr<null>`. If your service function returns one entity, its return type should
`PromiseErrorOr<One<E>>`, where `E` is type of the entity. If you service function returns multiple entities, its return
type should `PromiseErrorOr<Many<E>>`, where `E` is type of the entity. Any service function can always return an error.

Backk generates automatically integration tests for your service. If you want to benefit from them, it is important in which order, you
define the service functions. They should be defined in order in which they should be tested. 

SalesItemService.ts
```ts
import { _Id, CrudEntityService, Many, One, PromiseErrorOr } from 'backk';
import GetSalesItemsArg from './types/args/GetSalesItemsArg';
import { SalesItem } from './types/entities/SalesItem';

export default abstract class SalesItemService extends CrudEntityService {
  abstract deleteAllSalesItems(): PromiseErrorOr<null>;
  abstract createSalesItem(arg: SalesItem): PromiseErrorOr<One<SalesItem>>;
  abstract getSalesItems(arg: GetSalesItemsArg): PromiseErrorOr<Many<SalesItem>>;
  abstract getSalesItem(arg: _Id): PromiseErrorOr<One<SalesItem>>;
  abstract updateSalesItem(arg: SalesItem): PromiseErrorOr<null>;
  abstract deleteSalesItem(arg: _Id): PromiseErrorOr<null>;
}
```

Next you should provide implementation of you service in a separate class. Let's create a `SalesItemServiceImpl`
class in `src/services/salesitem` directory

SalesItemServiceImpl.ts
```ts
import SalesItemService from './SalesItemService';

export default class SalesItemServiceImpl extends SalesItemService {
}
```

### Create service constructor
SalesItemServiceImpl.ts
```ts
import { AbstractDataStore } from 'backk';
import SalesItemService from './SalesItemService';

export default class SalesItemServiceImpl extends SalesItemService {
  constructor(dataStore: AbstractDataStore) {
    super({}, dataStore);
  }
}
```

You need supply `dataStore` for your service, if it is using a database. Your service can use only one data store.
If you service requires multiple data store, your service is not probably a microservice. You should then split
you service to smaller pieces, so that each microservice requires only one data store to operate on.

For `CrudEntityService`, you need to give two parameters:
- map of error definitions (or an empty object if the service does not raise any errors specific to business logic in your service functions)
- dataStore

### Create Sales Item entity
We need to create the Sales item entity class so that we can use it in our sales item service implementation.
Let's create `SalesItem` class in directory `src/services/salesitem/types/entities`:

SalesItem.ts
```ts
import { _Id, Entity, IsAscii, IsFloat, ReadWrite } from 'backk';

@Entity()
export default class SalesItem extends _Id {
  @IsAscii()
  @Length(1, 128)
  @ReadWrite()
  name: string;
  
  @IsFloat()
  @MinMax(0, Number.MAX_VALUE)
  @ReadWrite()
  price: number;
}
```

Entity class is a blueprint for items to be stored in the data store (database). When you create an entity
class, it needs to be annotated with `@Entity()` decorator. The name of the entity class will be the name of
the table in the database.

For each property in the entity class, you need define a validator or validators. For `string` type properties,
you need the define a string validator, for example `@IsAcii()`. If you accept any string value, you should annotate
the string property with `@IsAnyString()` decorator. Additionally, you need to define what is the maximum length of
accepted string. You can use `@MaxLength` or `@Length()` decorator. The latter of which also defines the minimum length of 
the string. Limiting the maximum length of the string is crucial to prevent possible DoS (Denial of Service) attacks.

For number type properties, you must define one of following:
`@IsInt()`, `@IsFloat` or `@IsBigInt()`. In addition to that, you need to define the allowed range of values with
`@MinMax()` decorator. If some of the needed validators is missing, Backk will throw an exception about that.


### Implement first service function: deleteAllSalesItems
SalesItemServiceImpl.ts
```ts
import SalesItemService from './SalesItemService';

export default class SalesItemServiceImpl extends SalesItemService {
  @AllowForTests()
  deleteAllSalesItems(): PromiseErrorOr<null> {
    return this.dataStore.deleteAllEntities(SalesItem);
  }
}
```

