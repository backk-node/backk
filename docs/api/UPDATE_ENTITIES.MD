## Update Entities

- [updateEntity](#updateentity)
- [updateEntityByFilters](#updateentitybyfilters)
- [updateEntitiesByFilters](#updateentitiesbyfilters)

### <a name="updateentity"></a> updateEntity

```ts
class AbstractDataStore {
  updateEntity<T extends BackkEntity>(
    EntityClass: { new (): T },
    entityUpdate: RecursivePartial<T> & { _id: string },
    options?: {
      preHooks?: PreHook | PreHook[];
      entityPreHooks?: EntityPreHook<T> | EntityPreHook<T>[];
      postQueryOperations?: PostQueryOperations;
      postHook?: PostHook<T>;
    }
  ): PromiseErrorOr<null>;
}
```

Updates the entity of class `EntityClass` identified by `_id` in `entityUpdate` in the data store.
Only fields present in `entityUpdate` are updated.

`preHooks` are executed before the update operation.
`entityPreHooks` are executed before the update operation, and they get the current entity as argument.
if any of the pre-hooks fails, the whole update operation fails.

`postHook` is executed after the rupdate operation. If post-hook fails, the whole update operation fails. A post-hook can be used
for example to notify other microservices about the operation.

Returns nothing or error.

### <a name="updateentitybyfilters"></a> updateEntityByFilters

```ts
class AbstractDataStore {
  updateEntityByFilters<T extends BackkEntity>(
    EntityClass: { new (): T },
    filters: Array<MongoDbQuery<T> | SqlExpression | UserDefinedFilter> | Partial<T> | object,
    entityUpdate: Partial<T>,
    options?: {
      entityPreHooks?: EntityPreHook<T> | EntityPreHook<T>[];
      postQueryOperations?: PostQueryOperations;
      postHook?: PostHook<T>;
    }
  ): PromiseErrorOr<null>;
}
```

Updates the entity of class `EntityClass` identified by filter(s) `filters` in the data store.
Only fields present in `entityUpdate` are updated.

`entityPreHooks` are executed before the update operation, and they get the current entity as argument.
if any of the pre-hooks fails, the whole update operation fails.

`postHook` is executed after the update operation. If post-hook fails, the whole update operation fails. A post-hook can be used
for example to notify other microservices about the operation.

Returns nothing or error.

### <a name="updateentitiesbyfilters"></a> updateEntitiesByFilters

```ts
class AbstractDataStore {
  updateEntitiesByFilters<T extends BackkEntity>(
    EntityClass: { new (): T },
    filters: Array<MongoDbQuery<T> | SqlExpression | UserDefinedFilter> | Partial<T> | object,
    entityUpdate: Partial<T>
  ): PromiseErrorOr<null>;
}
```

Updates the entities of class `EntityClass` identified by filter(s) `filters` in the data store.
Only fields present in `entityUpdate` are updated.

Returns nothing or error.
