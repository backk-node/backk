## Introduction

Here we are going to build a small Backk microservice for handling sales items to showcase main Backk features.
For getting your Backk development environment setup, please follow instructions in [Get Started](../GET_STARTED.MD) section.

### Create Your First Service

Every Backk microservice consists of one or more services. 
You should place your services under `src/services` directory in Backk microservice project.
It is recommended to have a dedicated directory for each service. If multiple services share common code, it
should be placed in separate directory, for example `src/services/common` or `src/services/shared`.

Let's create a `SalesItemService` service for handling sales items. The following file should be placed in
`src/services/salesitem` directory in Backk microservice project. You extend your service class from  [BaseService](../api/BASE_SERVICES.MD#baseservice)

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


