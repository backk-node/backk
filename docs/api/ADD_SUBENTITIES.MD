## Add Sub-Entities

- [addSubEntitiesToEntityById](#addsubentitiestoentitybyid)
- [addSubEntitiesToEntityByFilters](#addsubentitiestoentitybyfilters)

### <a name="addsubentitiestoentitybyid"></a> addSubEntitiesToEntityById

```ts
interface DataStore {
  addSubEntitiesToEntityById<T extends BackkEntity, U extends SubEntity>(
    subEntityPath: string,
    subEntities: Array<Omit<U, 'id'> | { _id: string }>,
    EntityClass: { new (): T },
    _id: string,
    options?: {
      ifEntityNotFoundUse?: () => PromiseErrorOr<One<T>>;
      entityPreHooks?: EntityPreHook<T> | EntityPreHook<T>[];
      postQueryOperations?: PostQueryOperations;
      postHook?: PostHook<T>;
    }
  ): PromiseErrorOr<null>;
}
```

Finds an entity of class `EntityClass` by id `_id`, then adds sub-entities `subEntities` to path `subEntityPath`.

For example, if you have an `Order` entity with a property `orderItems: OrderItem[]`, you can add order items sub-entities (of class `OrderItem`) to path `orderItems`:

```ts
addSubEntitiesToEntityById('orderItems', orderItems, Order, orderId);
```

If entity by id `_id` is not found, then entity provided by `options.ifEntityNotFoundUse` function will be used instead.

`options.entityPreHooks` are executed before the add operation and if any of the pre-hooks fails, the whole add operation fails.
A pre-hook gets the entity as argument, and it can be used to validate the proper state of entity before the add operation. See [Hooks](HOOKS.MD) for details.

`options.postQueryOperations` is used to define post query operations for querying the entity before adding sub-entities. (E.g. for use in `entityPreHooks`). See [PostQueryOperations](POST_QUERY_OPERATIONS.MD) for details. If not supplied, instance of `DefaultPostQueryOperationsImpl` is used.

`options.postHook` is executed after add operation. If post-hook fails, the whole add operation fails. A post-hook can be used
for example to notify other microservices about the operation. See [Hooks](HOOKS.MD) for details.

Returns nothing or error.

Fetching entity for `options.entityPreHooks` or `options.postHook` uses `options.postQueryOperations`. If `options.postQueryOperations` is not supplied, instance of `DefaultPostQueryOperationsImpl` is used.
Instance of `DefaultPostQueryOperationsImpl` will fetch all entity fields, sort sub-entities by `id`, return the first page of sub-entities with page size of 50

### <a name="addsubentitiestoentitybyfilters"></a> addSubEntitiesToEntityByFilters

```ts
interface DataStore {
  addSubEntitiesToEntityByFilters<T extends BackkEntity, U extends SubEntity>(
    subEntityPath: string,
    subEntities: Array<Omit<U, 'id'> | { _id: string }>,
    EntityClass: { new (): T },
    filters: QueryFilters<T>,
    options?: {
      ifEntityNotFoundUse?: () => PromiseErrorOr<One<T>>;
      entityPreHooks?: EntityPreHook<T> | EntityPreHook<T>[];
      postQueryOperations?: PostQueryOperations;
      postHook?: PostHook<T>;
    }
  ): PromiseErrorOr<null>;
}
```

Finds an entity of class `EntityClass` by filter(s) `filters`, then adds sub-entities `subEntities` to path `subEntityPath`.

For example, if you have an `ShoppingCart` entity found by `userAccountId` with a property `shoppingCartItems: ShoppingCartItem[]`, you can add a shopping cart items sub-entities (of class `ShoppingCartItem`) to path `shoppingCartItems`:

```ts
addSubEntitiesToEntityByFilters('shoppingCartItems', shoppingCartItems, ShoppingCart, { userAccountId });
```

`filters` defines filter(s). See [Query Filters](QUERY_FILTERS.MD) for details.

If entity by filters `filters` is not found, then entity provided by `options.ifEntityNotFoundUse` function will be used instead.

`options.entityPreHooks` are executed before the add operation and if any of the pre-hooks fails, the whole add operation fails.
A pre-hook gets the entity as argument, and it can be used to validate the proper state of entity before the add operation. See [Hooks](HOOKS.MD) for details.

`options.postQueryOperations` is used to define post query operations for querying the entity before adding sub-entities. (E.g. for use in `entityPreHooks`). See [PostQueryOperations](POST_QUERY_OPERATIONS.MD) for details. If not supplied, instance of `DefaultPostQueryOperationsImpl` is used.

`options.postHook` is executed after add operation. If post-hook fails, the whole add operation fails. A post-hook can be used
for example to notify other microservices about the operation. See [Hooks](HOOKS.MD) for details.

Returns nothing or error.

Fetching entity for `options.entityPreHooks` or `options.postHook` uses `options.postQueryOperations`. If `options.postQueryOperations` is not supplied, instance of `DefaultPostQueryOperationsImpl` is used.
Instance of `DefaultPostQueryOperationsImpl` will fetch all entity fields, sort sub-entities by `id`, return the first page of sub-entities with page size of 50
