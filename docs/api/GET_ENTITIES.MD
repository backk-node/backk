## Get Entities

- [getAllEntities](#getallentities)
- [getEntityCount](#getentitycount)
- [getEntityById](#getentitybyid)
- [getEntitiesByIds](#getentitiesbyids)
- [getEntityByFilters](#getentitybyfilters)
- [getEntitiesByFilters](#getentitiesbyfilters)

### <a name="getallentities"></a> getAllEntities

```ts
class AbstractDataStore {
  getAllEntities<T extends BackkEntity>(
    EntityClass: new () => T,
    postQueryOperations: PostQueryOperations,
    allowFetchingOnlyCurrentOrPreviousOrNextPage: boolean,
    entityCountRequests?: EntityCountRequest[]
  ): PromiseErrorOr<Many<T>>;
}
```

Retrieves entities of class `EntityClass` from the data store.

`postQueryOperations` defines which entity fields are retrieved, the sorting order of entities and pagination of entities.

Returns the retrieved entities or error.

### <a name="getentitycount"></a> getEntityCount

```ts
class AbstractDataStore {
  getEntityCount<T extends BackkEntity>(
    EntityClass: new () => T,
    filters?: Array<MongoDbQuery<T> | SqlExpression | UserDefinedFilter> | Partial<T> | object
  ): PromiseErrorOr<number>;
}
```

Retrieves the count of entities of class `EntityClass` from the data store.

`filters` defined filter(s) for the count query.

Returns the number of entities or error.

### <a name="getentitybyid"></a> getEntityById

```ts
class AbstractDataStore {
  getEntityById<T extends BackkEntity>(
    EntityClass: { new (): T },
    _id: string,
    postQueryOperations: PostQueryOperations,
    allowFetchingOnlyCurrentOrPreviousOrNextPage: boolean,
    options?: {
      preHooks?: PreHook | PreHook[];
      ifEntityNotFoundReturn?: () => PromiseErrorOr<One<T>>;
      postHook?: PostHook<T>;
      entityCountRequests?: EntityCountRequest[];
    }
  ): PromiseErrorOr<One<T>>;
}
```

Retrieves the entity of class `EntityClass` identified by id `_id` from the data store.

`postQueryOperations` defines which entity/sub-entity fields are retrieved, the sorting order of sub-entities and pagination of sub-entities.

`preHooks` are executed before the retrieve operation and if any of the pre-hooks fails, the whole retrieve operation fails.

if entity by given id is not found, then entity given by `ifEntityNotFoundReturn` will be returned.

`postHook` is executed after the retrieve operation. If post-hook fails, the whole retrieve operation fails. A post-hook can be used
for example to notify other microservices about the operation.

Returns the entity or error.

### <a name="getentitiesbyids"></a> getEntitiesByIds

```ts
class AbstractDataStore {
  getEntitiesByIds<T extends BackkEntity>(
    EntityClass: { new (): T },
    _ids: string[],
    postQueryOperations: PostQueryOperations,
    allowFetchingOnlyCurrentOrPreviousOrNextPage: boolean,
    entityCountRequests?: EntityCountRequest[]
  ): PromiseErrorOr<Many<T>>;
}
```

Retrieves the entities of class `EntityClass` identified by ids `_ids` from the data store.

`postQueryOperations` defines which entity/sub-entity fields are retrieved, the sorting order of entities/sub-entities and pagination of entities/sub-entities.

Returns the entities or error.

### <a name="getentitybyfilters"></a> getEntityByFilters

```ts
class AbstractDataStore {
  getEntityByFilters<T extends BackkEntity>(
    EntityClass: { new (): T },
    filters: Array<MongoDbQuery<T> | SqlExpression | UserDefinedFilter> | Partial<T> | object,
    postQueryOperations: PostQueryOperations,
    allowFetchingOnlyCurrentOrPreviousOrNextPage: boolean,
    options?: {
      preHooks?: PreHook | PreHook[];
      ifEntityNotFoundReturn?: () => PromiseErrorOr<One<T>>;
      postHook?: PostHook<T>;
      entityCountRequests?: EntityCountRequest[];
    }
  ): PromiseErrorOr<One<T>>;
}
```

Retrieves the entity of class `EntityClass` matching filter(s) `filters` from the data store.

`postQueryOperations` defines which entity/sub-entity fields are retrieved, the sorting order of sub-entities and pagination of sub-entities.

`preHooks` are executed before the retrieve operation and if any of the pre-hooks fails, the whole retrieve operation fails.

if entity by given id is not found, then entity given by `ifEntityNotFoundReturn` will be returned.

`postHook` is executed after the retrieve operation. If post-hook fails, the whole retrieve operation fails. A post-hook can be used
for example to notify other microservices about the operation.

Returns the entity or error.

### <a name="getentitiesbyfilters"></a> getEntitiesByFilters

```ts
class AbstractDataStore {
  getEntitiesByFilters<T extends BackkEntity>(
    EntityClass: { new (): T },
    filters: Array<MongoDbQuery<T> | SqlExpression | UserDefinedFilter> | Partial<T> | object,
    postQueryOperations: PostQueryOperations,
    allowFetchingOnlyCurrentOrPreviousOrNextPage: boolean,
    options?: {
      preHooks?: PreHook | PreHook[];
      postHook?: EntitiesPostHook<T>;
      entityCountRequests?: EntityCountRequest[];
    }
  ): PromiseErrorOr<Many<T>>;
}
```

Retrieves the entities of class `EntityClass` matching filter(s) `filters` from the data store.

`postQueryOperations` defines which entity/sub-entity fields are retrieved, the sorting order of sub-entities and pagination of sub-entities.

`preHooks` are executed before the retrieve operation and if any of the pre-hooks fails, the whole retrieve operation fails.

`postHook` is executed after the retrieve operation. If post-hook fails, the whole retrieve operation fails. A post-hook can be used
for example to notify other microservices about the operation.

Returns the entities or error.
