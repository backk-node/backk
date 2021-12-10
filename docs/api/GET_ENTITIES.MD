## Get Entities

- [getAllEntities](#getallentities)
- [getEntityCount](#getentitycount)
- [getEntityById](#getentitybyid)
- [getEntitiesByIds](#getentitiesbyids)
- [getEntityByFilters](#getentitybyfilters)
- [getEntitiesByFilters](#getentitiesbyfilters)

### <a name="getallentities"></a> getAllEntities

```ts
interface DataStore {
  getAllEntities<T extends BackkEntity>(
    EntityClass: new () => T,
    postQueryOperations: PostQueryOperations,
    allowFetchingOnlyCurrentOrPreviousOrNextPage: boolean,
    entityCountRequests?: EntityCountRequest[]
  ): PromiseErrorOr<Many<T>>;
}

export default class EntityCountRequest {
  constructor(public readonly subEntityPath: string) {}
}
```

Retrieves entities of class `EntityClass` from the data store.

`postQueryOperations` defines which entity fields are retrieved, the sorting order of entities and pagination of entities. See [PostQueryOperations](POST_QUERY_OPERATIONS.MD) for details.

`allowFetchingOnlyCurrentOrPreviousOrNextPage` specifies if client can fetch any page or only current, previous or next page.

`entityCountRequests` specifies which entity counts should be returned to the client. For example `[ {subEntityPath: ''' }]` returns entity counts for the root entity. Entity count is available in property `_count`

Returns the retrieved entities or error.

### <a name="getentitycount"></a> getEntityCount

```ts
interface DataStore {
  getEntityCount<T extends BackkEntity>(
    EntityClass: new () => T,
    filters?: QueryFilters<T>
  ): PromiseErrorOr<number>;
}
```

Retrieves the count of entities of class `EntityClass` from the data store.

`filters` defines filter(s) for the count query. See [Query Filters](QUERY_FILTERS.MD) for details.

Returns the number of entities or error.

### <a name="getentitybyid"></a> getEntityById

```ts
interface DataStore {
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

`postQueryOperations` defines which entity/sub-entity fields are retrieved, the sorting order of sub-entities and pagination of sub-entities. See [PostQueryOperations](POST_QUERY_OPERATIONS.MD) for details.

`allowFetchingOnlyCurrentOrPreviousOrNextPage` specifies if client can fetch any page or only current, previous or next page.

`preHooks` are executed before the retrieve operation and if any of the pre-hooks fails, the whole retrieve operation fails. See [Hooks](HOOKS.MD) for details.

if entity by given id is not found, then entity given by `ifEntityNotFoundReturn` will be returned.

`postHook` is executed after the retrieve operation. If post-hook fails, the whole retrieve operation fails. A post-hook can be used
for example to notify other microservices about the operation. See [Hooks](HOOKS.MD) for details.

`entityCountRequests` specifies which entity counts should be returned to the client. For example `[ {subEntityPath: ''' }]` returns entity counts for the root entity. Entity count is available in property `_count`

Returns the entity or error.

### <a name="getentitiesbyids"></a> getEntitiesByIds

```ts
interface DataStore {
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

`postQueryOperations` defines which entity/sub-entity fields are retrieved, the sorting order of entities/sub-entities and pagination of entities/sub-entities. See [PostQueryOperations](POST_QUERY_OPERATIONS.MD) for details.

`allowFetchingOnlyCurrentOrPreviousOrNextPage` specifies if client can fetch any page or only current, previous or next page.

`entityCountRequests` specifies which entity counts should be returned to the client. For example `[ {subEntityPath: ''' }]` returns entity counts for the root entity. Entity count is available in property `_count`

Returns the entities or error.

### <a name="getentitybyfilters"></a> getEntityByFilters

```ts
interface DataStore {
  getEntityByFilters<T extends BackkEntity>(
    EntityClass: { new (): T },
    filters: QueryFilters<T>,
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

`filters` defines filter(s) for the query. See [Query Filters](QUERY_FILTERS.MD) for details.

`postQueryOperations` defines which entity/sub-entity fields are retrieved, the sorting order of sub-entities and pagination of sub-entities. See [PostQueryOperations](POST_QUERY_OPERATIONS.MD) for details.

`allowFetchingOnlyCurrentOrPreviousOrNextPage` specifies if client can fetch any page or only current, previous or next page.

`preHooks` are executed before the retrieve operation and if any of the pre-hooks fails, the whole retrieve operation fails. See [Hooks](HOOKS.MD) for details.

if entity by given id is not found, then entity given by `ifEntityNotFoundReturn` will be returned.

`postHook` is executed after the retrieve operation. If post-hook fails, the whole retrieve operation fails. A post-hook can be used
for example to notify other microservices about the operation. See [Hooks](HOOKS.MD) for details.

`entityCountRequests` specifies which entity counts should be returned to the client. For example `[ {subEntityPath: ''' }]` returns entity counts for the root entity. Entity count is available in property `_count`

Returns the entity or error.

### <a name="getentitiesbyfilters"></a> getEntitiesByFilters

```ts
interface DataStore {
  getEntitiesByFilters<T extends BackkEntity>(
    EntityClass: { new (): T },
    filters: QueryFilters<T>,
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

`filters` defines filter(s) for the query. See [Query Filters](QUERY_FILTERS.MD) for details.

`postQueryOperations` defines which entity/sub-entity fields are retrieved, the sorting order of sub-entities and pagination of sub-entities. See [PostQueryOperations](POST_QUERY_OPERATIONS.MD) for details.

`allowFetchingOnlyCurrentOrPreviousOrNextPage` specifies if client can fetch any page or only current, previous or next page.

`preHooks` are executed before the retrieve operation and if any of the pre-hooks fails, the whole retrieve operation fails. See [Hooks](HOOKS.MD) for details.

`postHook` is executed after the retrieve operation. If post-hook fails, the whole retrieve operation fails. A post-hook can be used
for example to notify other microservices about the operation. See [Hooks](HOOKS.MD) for details.

`entityCountRequests` specifies which entity counts should be returned to the client. For example `[ {subEntityPath: ''' }]` returns entity counts for the root entity. Entity count is available in property `_count`

Returns the entities or error.
