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

```ts
type PromiseErrorOr<T> = Promise<[T | null | undefined, BackkError | null | undefined]>;

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

Backk generates automatically integration tests for your service. If you want to benefit from them, it is important in which order, you
define the service functions. They should be defined in order in which they should be tested. 

SalesItemService.ts
```ts
import { _Id, CrudEntityService, Many, One, PromiseErrorOr } from 'backk';
import GetSalesItemsArg from './types/args/GetSalesItemsArg';
import SalesItem from './types/entities/SalesItem';

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
accepted string. You can use `@MaxLength` or `@Length()` decorator. The latter of which also defines the minimum length of 
the string. Limiting the maximum length of the string is crucial to prevent possible DoS (Denial of Service) attacks.

For number type properties, you must define one of following:
`@IsInt()`, `@IsFloat` or `@IsBigInt()`. In addition to that, you need to define the allowed range of values with
`@MinMax()` decorator. If some needed validators is missing, Backk will throw an exception about that.

For each property you must define the access mode of the property. The access mode defines the visibility of the 
property to the clients of the microservice. The following access mode decorators are available:
- `@Private()`    
- `@ReadWrite()`  
- `@ReadOnly()`   
- `@ReadUpdate()`
- `@WriteOnly()`  
- `@CreateOnly()`
- `@UpdateOnly()`

The exclamation mark (!) after property names is needed because properties are not initialized in constructor.
Otherwise, you will get a TypeScript compiler warnings.

### Implement deleteAllSalesItems

Let´s practice Test driven development (TDD) for our first service function to showcase that Backk is ready
configured for unit testing with Jest.

First we will write our spec file to specify the functionality of the `deleteAllEntities` method:

SalesItemServiceImpl.spec.ts

```ts
import { NullDataStore } from 'backk';
import SalesItemService from './SalesItemService';
import SalesItem from './types/entities/SalesItem';

const dataStore = new NullDataStore();
const salesItemService = new SalesItemService(dataStore);

describe('SalesItemService', () => {
  describe('deleteAllEntities', () => {
    it('should call the data store´s deleteAllEntities method once with SalesItem entity class as parameter and return null without error', async () => {
      // GIVEN
      dataStore.deleteAllEntities = jest.fn().mockReturnValue(Promise.resolve([null, null]));
      
      // WHEN
      const [entity, error] = await salesItemService.deleteAllEntities();
      
      // THEN
      expect(dataStore.deleteAllEntities).toHaveBeenCalledTimes(1);
      expect(dataStore.deleteAllEntities).toHaveBeenCalledWith(SalesItem);
      expect(entity).toBeNull();
      expect(error).toBeNull();
    })
  })
})
```

Let's test our unit test by executing:
```bash
npm test
```

Test will fail because we havent implemented the `deleteAllEntities` function in `SalesItemServiceImpl` class.
Let´s implement the function:

SalesItemServiceImpl.ts
```ts
import { AllowForTests, PromiseErrorOr } from 'backk';
import SalesItemService from './SalesItemService';
import SalesItem from './types/entities/SalesItem';

export default class SalesItemServiceImpl extends SalesItemService {
  @AllowForTests()
  deleteAllSalesItems(): PromiseErrorOr<null> {
    return this.dataStore.deleteAllEntities(SalesItem);
  }
}
```

Now we can execute `npm test` again and make our unit test to pass.

Each Backk service function must have an authorization annotation for improved security reasons.
For the above service function, we use `@AllowForTests` decorator to indicate that this service function
can only be accessed when executing tests, it cannot be accessed by any outside clients at all.

There are following possible authorization decorators available for use:
- `@AllowForEveryUser()`
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
    it('should call the data store´s createEntity method once with SalesItem class as first parameter and sales item entity as second parameter and should return the entity.', async () => {
      // GIVEN
      const salesItem = {
        name: 'Sales item 1',
        price: 50
      };
      
      dataStore.createEntity = jest.fn().mockReturnValue(Promise.resolve([salesItem, null]));
      
      // WHEN
      const [createdSalesItem, error] = await salesItemService.createSalesItem(salesItem);
      
      // THEN
      expect(dataStore.createEntity).toHaveBeenCalledTimes(1);
      expect(dataStore.createEntity).toHaveBeenCalledWith(SalesItem, salesItem);
      expect(createdSalesItem).toBe(salesItem);
      expect(error).toBeNull();
    })
  })
})
```

SalesItemServiceImpl.ts
```ts
import {  AllowForUserRoles, PromiseErrorOr } from 'backk';
import SalesItemService from './SalesItemService';
import SalesItem from './types/entities/SalesItem';

export default class SalesItemServiceImpl extends SalesItemService {
  @AllowForUserRoles(['admin', 'salesAdmin'])
  createSalesItem(salesItem: SalesItem): PromiseErrorOr<null> {
    return this.dataStore.createEntity(SalesItem, salesItem);
  }
}
```

Creating a new sales item is only allowed for logged-in users with either `admin` or `salesAdmin` role.

### Implement getSalesItem

We skip the unit test writing for the rest of the SalesItemService implementation.

```ts
import { AllowForEveryUser, PromiseErrorOr, SqlExpression } from 'backk';
import SalesItemService from './SalesItemService';
import SalesItem from './types/entities/SalesItem';

export default class SalesItemServiceImpl extends SalesItemService {
  @AllowForEveryUser()
  getSalesItems({ nameSubString }: GetSalesItemsArg): PromiseErrorOr<Many<SalesItem>> {
    const filter = new SqlExpression('name LIKE :nameSubString', {
      nameSubString: nameSubString ? `%${nameSubString}%` : undefined
    });
    
    const postQueryOperations = new DefaultPostQueryOperations();

    return this.dataStore.getEntitiesByFilters(SalesItem, [filter], postQueryOperations, true);
  }
}
```

Here is the implementation for the service function argument class. Service function arguments must be Javascript
classes and their properties need same kind of validation as entity class properties need. This is needed to ensure
that only valid values are supplied to service function.

GetSalesItemsArg.ts
import { IsAscii, MaxLength } from 'backk';

```ts
export default class GetSalesItemsArg {
  @IsAscii()
  @MaxLength(128)
  nameSubString: string;
}
```

For data store's `getEntitiesByFilters` you need to supply `postQueryOperations`.
They are needed and used to define what response fields are wanted, how returned entities are sorted and paginated.

Here is the definition of `PostQueryOperations` interface:
```ts
interface PostQueryOperations extends Projection, SortBys {
  paginations?: Pagination[];
  currentPageTokens?: CurrentPageToken[];
}

interface Projection {
  includeResponseFields?: string[];
  excludeResponseFields?: string[];
}

interface SortBys {
  sortBys?: SortBy[];
}

class SortBy {
  subEntityPath?: string = '';
  fieldName!: string;
  sortDirection!: 'ASC' | 'DESC';
}

class Pagination {
  subEntityPath?: string = '';
  pageNumber!: number;
  pageSize!: number;
}
```


### Implement rest of the SalesItemService

```ts
import { AllowForEveryUser, PromiseErrorOr } from 'backk';
import SalesItemService from './SalesItemService';
import SalesItem from './types/entities/SalesItem';

export default class SalesItemServiceImpl extends SalesItemService {
  @AllowForEveryUser()
  getSalesItems(arg: GetSalesItemsArg): PromiseErrorOr<Many<SalesItem>> {
    return this.dataStore.getEntitiesByFilters()
  }
  
  getSalesItem(arg: _Id): PromiseErrorOr<One<SalesItem>>;
  updateSalesItem(arg: SalesItem): PromiseErrorOr<null>;
  deleteSalesItem(arg: _Id): PromiseErrorOr<null>;
}
```
