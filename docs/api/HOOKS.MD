## Hooks

Hooks are operations performed before or after a data store operation.

- [Pre-Hooks](#pre-hooks)
- [Entity Pre-Hooks](#entity-pre-hooks)
- [Post-Hook](#post-hook)
- [Entities Post-Hook](#entities-post-hook)

### <a name="pre-hooks"></a>Pre-Hooks
Pre-hook is executed before the actual database operation. If pre-hook fails, the whole db operation fails and
returns the specified `error`. You can also control if pre-hook is executed or not with `executePreHookIf`

```ts
export type PreHook<> =
  | {
      executePreHookIf?: () => boolean | Promise<boolean> | PromiseErrorOr<boolean>;
      shouldSucceedOrBeTrue: () =>
        | PromiseErrorOr<Many<BackkEntity> | One<BackkEntity> | null>
        | Promise<boolean | BackkError | null | undefined | void>
        | boolean;
      error?: ErrorDefinition;
    }
  | (() =>
      | PromiseErrorOr<boolean | Many<BackkEntity> | One<BackkEntity> | null>
      | Promise<boolean | BackkError | null | undefined | void>
      | boolean);

type ErrorDefinition = {
  readonly errorCode: string | number;
  readonly message: string;
  readonly statusCode: number;
};
```

Below is an example of a pre-hook that checks that there are not too many sales items for user, before 
creating a new sales item.

```ts
class SalesItemServiceImpl extends CrudEntityService implements SalesItemService {
  async createSalesItem(salesItem: SalesItem): PromiseErrorOr<One<SalesItem>> {
    const [createdSalesItem, error] = await this.dataStore.createEntity(
      SalesItem,
      {
        ...salesItem,
        state: 'forSale',
        previousPrice: null,
        primaryImageThumbnailDataUri: getThumbnailImageDataUri(salesItem.primaryImageDataUri),
        likeCount: 0,
      },
      {
        preHooks: {
          shouldSucceedOrBeTrue: async () => {
            const [usersSellableSalesItemCount, error] = await this.dataStore.getEntityCount(SalesItem, {
              userAccountId: salesItem.userAccountId,
              state: 'forSale',
            });

            return typeof usersSellableSalesItemCount === 'number'
              ? usersSellableSalesItemCount < 100
              : error;
          },
          error: salesItemServiceErrors.maximumSalesItemCountPerUserExceeded,
        },
      }
    );
  }
}
```

### <a name="entity-pre-hooks"></a>Entity Pre-Hooks
Entity pre-hook is executed before the actual database operation. If pre-hook fails, the whole db operation fails and
returns the specified `error`. You can also control if pre-hook is executed or not with `executePreHookIf`.
Entity pre-hook functions receive the current entity as it is in database as an argument.

```ts
export type EntityPreHook<T extends BackkEntity | SubEntity> =
  | {
      executePreHookIf?: (entity: T) => boolean | Promise<boolean> | PromiseErrorOr<boolean>;
      shouldSucceedOrBeTrue: (
        entity: T
      ) =>
        | PromiseErrorOr<One<BackkEntity> | Many<BackkEntity> | null>
        | Promise<boolean | BackkError | null | undefined>
        | boolean;
      error?: ErrorDefinition;
    }
  | ((
      entity: T
    ) =>
      | PromiseErrorOr<boolean | Many<BackkEntity> | One<BackkEntity> | null>
      | Promise<boolean | BackkError | null | undefined>
      | boolean);

type ErrorDefinition = {
  readonly errorCode: string | number;
  readonly message: string;
  readonly statusCode: number;
};
```

Below is an example of using entity pre-hook. Before emptying a shopping cart, an entity pre-hook is called
to change the state of sales items in shopping cart from 'reserved' to 'forSale'.

```ts
class ShoppingCartServiceImpl extends CrudEntityService implements ShoppingCartService {
  emptyShoppingCart({ userAccountId }: UserAccountId): PromiseErrorOr<null> {
    return this.dataStore.deleteEntityByFilters(
      ShoppingCart,
      { userAccountId },
      {
        entityPreHooks: ({ salesItems }) =>
          this.salesItemService.updateSalesItemStatesByFilters(
            salesItems.map(({ _id }) => _id),
            'forSale',
            'reserved',
            userAccountId
          ),
      }
    );
  }
}
```

### <a name="post-hook"></a>Post-Hook
Post-hook is executed after the actual database operation. If post-hook fails, the whole db operation fails and
returns the specified `error`. You can also control if post-hook is executed or not with `executePostHookIf`.
Post-hook functions receive the changed entity after the database operation as an argument.

```ts
export type PostHook<T extends BackkEntity | SubEntity> =
  | {
      executePostHookIf?: (entity: T | null) => boolean;
      shouldSucceedOrBeTrue: (
        entity: T | null
      ) => PromiseErrorOr<One<BackkEntity> | null> | Promise<boolean> | boolean;
      error?: ErrorDefinition;
    }
  | ((entity: T | null) => PromiseErrorOr<One<BackkEntity> | null> | Promise<boolean> | boolean);
```

Below is an example where post-hook is used to send a notification about sales item price change:

```ts
class SalesItemServiceImpl extends CrudEntityService implements SalesItemService {
  updateSalesItem(salesItem: SalesItem): PromiseErrorOr<null> {
    let isPriceUpdated: boolean;

    return this.dataStore.updateEntity(SalesItem, salesItem, {
      entityPreHooks: [
        {
          shouldSucceedOrBeTrue: ({ state }) => state === 'forSale',
          error: salesItemServiceErrors.salesItemStateIsNotForSale,
        },
        ({ _id, price }) => {
          if (salesItem.price !== price) {
            isPriceUpdated = true;
            return this.dataStore.updateEntity(SalesItem, { _id, previousPrice: price });
          }
          return true;
        },
      ],
      postHook: {
        executePostHookIf: () => isPriceUpdated,
        shouldSucceedOrBeTrue: () =>
          sendToRemoteService(
            'kafka',
            'notification-service',
            'salesItemNotificationService.sendPriceChangeNotifications',
            {
              salesItemId: salesItem._id,
              salesItemTitle: salesItem.title,
              salesItemNewPrice: salesItem.price,
              userAccountIdsToNotify: salesItem.priceChangeFollowingUserAccountIds,
            }
          ),
      },
    });
  }
}
```

### <a name="entities-post-hook"></a>Entities Post-Hook
Same as post-hook but receives multiple entities as hook functions argument.

```ts
export type EntitiesPostHook<T extends BackkEntity | SubEntity> =
  | {
      executePostHookIf?: (entity: T[] | null) => boolean;
      shouldSucceedOrBeTrue: (
        entity: T[] | null
      ) => PromiseErrorOr<One<BackkEntity> | null> | Promise<boolean> | boolean;
      error?: ErrorDefinition;
    }
  | ((entity: T[] | null) => PromiseErrorOr<One<BackkEntity> | null> | Promise<boolean> | boolean);
```

Below is an example of Entities post-hook which changes the state of sales items of an unpaid order to 'forSale':

```ts
const [, error] = await this.dataStore.getEntitiesByFilters(
    Order,
    unpaidOrderFilters,
    {
      includeResponseFields: ['orderItems.salesItems._id'],
      paginations: [{ subEntityPath: '*', pageSize: 1000, pageNumber: 1 }],
    },
    false,
    {
      postHook: (unpaidOrders) => {
        const salesItemIdsToUpdate = JSONPath({
          json: unpaidOrders ?? null,
          path: '$[*].orderItems[*].salesItems[*]._id',
        });

        const salesItemFilters = this.dataStore.getFilters({ _id: { $in: salesItemIdsToUpdate } }, [
          new SqlInFilter('_id', salesItemIdsToUpdate),
        ]);

        return salesItemIdsToUpdate.length > 0
          ? this.dataStore.updateEntitiesByFilters(SalesItem, salesItemFilters, { state: 'forSale' })
          : true;
      },
    }
  );
```
