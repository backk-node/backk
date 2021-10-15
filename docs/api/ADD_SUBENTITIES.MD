## Add Sub-Entities

- [addSubEntitiesToEntityById](#addsubentitiestoentitybyid)
- [addSubEntitiesToEntityByFilters](#addsubentitiestoentitybyfilters)

### <a name="addsubentitiestoentitybyid"></a> addSubEntitiesToEntityById

```ts
class AbstractDataStore {
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

For example, if you have an `Order` entity with a property `orderItems: OrderItem[]`, you can add an order items sub-entities (of class `OrderItem`) to path `orderItems`:

```ts
addSubEntitiesToEntityById('orderItems', orderItems, Order, orderId);
```

If entity by id `_id` is not found, then entity provided by `ifEntityNotFoundUse` function will be used instead.

`preHooks` are executed before the add operation and if any of the pre-hooks fails, the whole add operation fails.
A pre-hook gets the entity as argument, and it can be used to validate the proper state of entity before the add operation.

`postHook` is executed after add operation. If post-hook fails, the whole add operation fails. A post-hook can be used
for example to notify other microservices about the operation.

Returns nothing or error.

### <a name="addsubentitiestoentitybyfilters"></a> addSubEntitiesToEntityByFilters

```ts
class AbstractDataStore {
  addSubEntitiesToEntityByFilters<T extends BackkEntity, U extends SubEntity>(
    subEntityPath: string,
    subEntities: Array<Omit<U, 'id'> | { _id: string }>,
    EntityClass: { new (): T },
    filters: Array<MongoDbQuery<T> | SqlExpression | UserDefinedFilter> | Partial<T> | object,
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

If entity by filters `filters` is not found, then entity provided by `ifEntityNotFoundUse` function will be used instead.

`preHooks` are executed before the add operation and if any of the pre-hooks fails, the whole add operation fails.
A pre-hook gets the entity as argument, and it can be used to validate the proper state of entity before the add operation.

`postHook` is executed after add operation. If post-hook fails, the whole add operation fails. A post-hook can be used
for example to notify other microservices about the operation.

Returns nothing or error.
