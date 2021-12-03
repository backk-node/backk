## Delete Entities

- [deleteAllEntities](#deleteallentities)
- [deleteEntityById](#deleteentitybyid)
- [deleteEntitiesByIds](#deleteentitiesbyids)
- [deleteEntityByFilters](#deleteentitybyfilters)
- [deleteEntitiesByFilters](#deleteentitiesbyfilters)

### <a name="deleteallentities"></a> deleteAllEntities

```ts
interface DataStore {
  deleteAllEntities<T>(EntityClass: new () => T): PromiseErrorOr<null>;
}
```

Deletes all entities of class `EntityClass` from the data store.

Returns nothing or error.

### <a name="deleteentitybyid"></a> deleteEntityById

```ts
interface DataStore {
  deleteEntityById<T extends BackkEntity>(
    EntityClass: { new (): T },
    _id: string,
    options?: {
      entityPreHooks?: EntityPreHook<T> | EntityPreHook<T>[];
      postQueryOperations?: PostQueryOperations;
      postHook?: PostHook<T>;
    }
  ): PromiseErrorOr<null>;
}
```

Deletes the entities of class `EntityClass` identified by id `_id` from the data store.

Returns nothing or error.

### <a name="deleteentitiesbyids"></a> deleteEntitiesByIds

```ts
interface DataStore {
  deleteEntitiesByIds<T extends BackkEntity>(
    EntityClass: { new (): T },
    _ids: string[]
  ): PromiseErrorOr<null>;
}
```

Deletes the entities of class `EntityClass` identified by ids `_ids` from the data store.

Returns nothing or error.

### <a name="deleteentitybyfilters"></a> deleteEntityByFilters

```ts
interface DataStore {
  deleteEntityByFilters<T extends BackkEntity>(
    EntityClass: { new (): T },
    filters: Array<MongoDbQuery<T> | SqlExpression | UserDefinedFilter> | Partial<T> | object,
    options?: {
      entityPreHooks?: EntityPreHook<T> | EntityPreHook<T>[];
      postQueryOperations?: PostQueryOperations;
      postHook?: PostHook<T>;
    }
  ): PromiseErrorOr<null>;
}
```

Deletes the entity of class `EntityClass` matching filters `filters` from the data store.

`entityPreHooks` are executed before the delete operation, and they get the current entity as argument.
if any of the pre-hooks fails, the whole delete operation fails.

`postHook` is executed after the delete operation. If post-hook fails, the whole delete operation fails. A post-hook can be used
for example to notify other microservices about the operation.

Returns nothing or error.

### <a name="deleteentitiesbyfilters"></a> deleteEntitiesByFilters

```ts
interface DataStore {
  deleteEntitiesByFilters<T extends BackkEntity>(
    EntityClass: { new (): T },
    filters: Array<MongoDbQuery<T> | SqlExpression | UserDefinedFilter> | Partial<T> | object
  ): PromiseErrorOr<null>;
}
```

Deletes the entities of class `EntityClass` matching filters `filters` from the data store.

Returns nothing or error.
