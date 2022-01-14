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

Deletes the entity of class `EntityClass` identified by id `_id` from the data store.

`options.entityPreHooks` are executed before the delete operation, and they get the current entity as argument.
if any of the pre-hooks fails, the whole delete operation fails. See [Hooks](HOOKS.MD) for details.

`options.postQueryOperations` is used to define post query operations for querying the entity before delete. (E.g. for use in `entityPreHooks`). See [PostQueryOperations](POST_QUERY_OPERATIONS.MD) for details.  If not supplied, instance of `DefaultPostQueryOperationsImpl` is used.

`options.postHook` is executed after the delete operation. If post-hook fails, the whole delete operation fails. A post-hook can be used
for example to notify other microservices about the operation. See [Hooks](HOOKS.MD) for details.

Fetching entity for `options.entityPreHooks` uses `options.postQueryOperations`. If `options.postQueryOperations` is not supplied, instance of `DefaultPostQueryOperationsImpl` is used.
Instance of `DefaultPostQueryOperationsImpl` will fetch all entity fields, sort sub-entities by `id`, return the first page of sub-entities with page size of 50


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
    filters: QueryFilters<T>,
    options?: {
      entityPreHooks?: EntityPreHook<T> | EntityPreHook<T>[];
      postQueryOperations?: PostQueryOperations;
      postHook?: PostHook<T>;
    }
  ): PromiseErrorOr<null>;
}
```

Deletes the entity of class `EntityClass` matching filters `filters` from the data store.

`filters` defines filter(s). See [Query Filters](QUERY_FILTERS.MD) for details.

`options.entityPreHooks` are executed before the delete operation, and they get the current entity as argument.
if any of the pre-hooks fails, the whole delete operation fails. See [Hooks](HOOKS.MD) for details.

`options.postQueryOperations` is used to define post query operations for querying the entity before delete. (E.g. for use in `entityPreHooks`). See [PostQueryOperations](POST_QUERY_OPERATIONS.MD) for details.  If not supplied, instance of `DefaultPostQueryOperationsImpl` is used.

`options.postHook` is executed after the delete operation. If post-hook fails, the whole delete operation fails. A post-hook can be used
for example to notify other microservices about the operation. See [Hooks](HOOKS.MD) for details.

Returns nothing or error.

Fetching entity for `options.entityPreHooks` uses `options.postQueryOperations`. If `options.postQueryOperations` is not supplied, instance of `DefaultPostQueryOperationsImpl` is used.
Instance of `DefaultPostQueryOperationsImpl` will fetch all entity fields, sort sub-entities by `id`, return the first page of sub-entities with page size of 50


### <a name="deleteentitiesbyfilters"></a> deleteEntitiesByFilters

```ts
interface DataStore {
  deleteEntitiesByFilters<T extends BackkEntity>(
    EntityClass: { new (): T },
    filters: QueryFilters<T>
  ): PromiseErrorOr<null>;
}
```

Deletes the entities of class `EntityClass` matching filters `filters` from the data store.

`filters` defines filter(s). See [Query Filters](QUERY_FILTERS.MD) for details.

Returns nothing or error.
