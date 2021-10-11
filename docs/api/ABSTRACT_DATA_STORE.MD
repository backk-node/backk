### AbstractDataStore

- [createEntity](#createentity)
- [createEntities](#createEntities)
<br/>

- [addSubEntitiesToEntityById](#addsubentitiestoentitybyid)
- [addSubEntitiesToEntityByFilters](#addsubentitiestoentitybyfilters)
<br/>

- [getAllEntities](#getallentities)
- [getEntityCount](#getentitycount)
- [getEntityById](#getentitybyid)
- [getEntitiesByIds](#getentitiesbyids)
- [getEntityByFilters](#getentitybyfilters)
- [getEntitiesByFilters](#getentitiesbyfilters)
<br/>

- [updateEntity](#updateentity)
- [updateEntityByFilters](#updateentitybyfilters)
- [updateEntitiesByFilters](#updateentitiesbyfilters)
<br/>

- [deleteAllEntities](#deleteallentities)
- [deleteEntityById](#deleteentitybyid)
- [deleteEntitiesByIds](#deleteentitiesbyids)
- [deleteEntityByFilters](#deleteentitybyfilters)
- [deleteEntitiesByFilters](#deleteentitiesbyfilters)
<br/>

- [removeSubEntityFromEntityById](#removesubentityfromentitybyid)
- [removeSubEntitiesFromEntityById](#removesubentitiesfromentitybyid)
- [removeSubEntityFromEntityByFilters](#removesubentityfromentitybyfilters)
- [removeSubEntitiesFromEntityByFilters](#removesubentitiesfromentitybyfilters)
<br/>

- [addArrayFieldValuesToEntityById](#addarrayfieldvaluestoentitybyid)
- [doesArrayFieldContainValueInEntityById](#doesarrayfieldcontainvalueinentitybyid)
- [removeArrayFieldValuesFromEntityById](#removearrayfieldsvaluesfromentitybyid)
<br/>

- [executeInsideTransaction](#executeinsidetransaction)

#### <a name="createentity"></a> createEntity

```ts
class AbstractDataStore {
  createEntity<T extends BackkEntity>(
    EntityClass: { new (): T },
    entity: Omit<T, '_id' | 'createdAtTimestamp' | 'version' | 'lastModifiedTimestamp'>,
    options?: {
      preHooks?: PreHook | PreHook[];
      postQueryOperations?: PostQueryOperations;
      postHook?: PostHook<T>;
    }
  ): PromiseErrorOr<One<T>>;
}
```

Creates a new entity `entity` of class `EntityClass` in the data store.

`preHooks` are executed before the create operation and if any of the pre-hooks fails, the whole create operation fails.

`postHook` is executed after create operation. If post-hook fails, the whole create operation fails.

Returns the created entity or error.

#### <a name="createentity"></a> createEntities

```ts
class AbstractDataStore {
  createEntities<T extends BackkEntity>(
    EntityClass: { new (): T },
    entities: Array<Omit<T, '_id' | 'createdAtTimestamp' | 'version' | 'lastModifiedTimestamp'>>,
    options?: {
      preHooks?: PreHook | PreHook[];
      postQueryOperations?: PostQueryOperations;
      postHook?: PostHook<T>;
    }
  ): PromiseErrorOr<Many<T>>;
}
```

Creates new entities `entities` of class `EntityClass` in the data store.

`preHooks` are executed before the create
operation and if any of the pre-hooks fails, the whole create operation fails.

`postHook` is executed after create operation.
If post-hook fails, the whole create operation fails.

Returns the created entities or error.

#### <a name="addsubentitiestoentitybyid"></a> addSubEntitiesToEntityById

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

#### <a name="addsubentitiestoentitybyfilters"></a> addSubEntitiesToEntityByFilters

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

#### <a name="getallentities"></a> getAllEntities

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

#### <a name="getentitycount"></a> getEntityCount

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

#### <a name="getentitybyid"></a> getEntityById

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

#### <a name="getentitiesbyids"></a> getEntitiesByIds

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

#### <a name="getentitybyfilters"></a> getEntityByFilters

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

#### <a name="getentitiesbyfilters"></a> getEntitiesByFilters

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

#### <a name="updateentity"></a> updateEntity

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

#### <a name="updateentitybyfilters"></a> updateEntityByFilters

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

#### <a name="updateentitiesbyfilters"></a> updateEntitiesByFilters

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

#### <a name="deleteallentities"></a> deleteAllEntities

```ts
class AbstractDataStore {
  deleteAllEntities<T>(EntityClass: new () => T): PromiseErrorOr<null>;
}
```

Deletes all entities of class `EntityClass` from the data store.

Returns nothing or error.

#### <a name="deleteentitybyid"></a> deleteEntityById

```ts
class AbstractDataStore {
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

#### <a name="deleteentitiesbyids"></a> deleteEntitiesByIds

```ts
class AbstractDataStore {
  deleteEntitiesByIds<T extends BackkEntity>(
    EntityClass: { new (): T },
    _ids: string[]
  ): PromiseErrorOr<null>;
}
```

Deletes the entities of class `EntityClass` identified by ids `_ids` from the data store.

Returns nothing or error.

#### <a name="deleteentitybyfilters"></a> deleteEntityByFilters

```ts
class AbstractDataStore {
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

#### <a name="deleteentitiesbyfilters"></a> deleteEntitiesByFilters

```ts
class AbstractDataStore {
  deleteEntitiesByFilters<T extends BackkEntity>(
    EntityClass: { new (): T },
    filters: Array<MongoDbQuery<T> | SqlExpression | UserDefinedFilter> | Partial<T> | object
  ): PromiseErrorOr<null>;
}
```

Deletes the entities of class `EntityClass` matching filters `filters` from the data store.

Returns nothing or error.

#### <a name="removesubentityfromentitybyid"></a> removeSubEntityFromEntityById

```ts
class AbstractDataStore {
  removeSubEntityFromEntityById<T extends BackkEntity>(
    subEntityPath: string,
    subEntityId: string,
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

Finds an entity of class `EntityClass` by id `_id`, then remove sub-entity with id `subEntityId` from path `subEntityPath`.

`entityPreHooks` are executed before the delete operation, and they get the current entity as argument.
if any of the pre-hooks fails, the whole delete operation fails.

`postHook` is executed after the delete operation. If post-hook fails, the whole delete operation fails. A post-hook can be used
for example to notify other microservices about the operation.

Returns nothing or error.

#### <a name="removesubentitiesfromentitybyid"></a> removeSubEntitiesFromEntityById

```ts
class AbstractDataStore {
  removeSubEntitiesFromEntityById<T extends BackkEntity>(
    subEntitiesJsonPath: string,
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

Finds an entity of class `EntityClass` by id `_id`, then removes sub-entities matching [JSON path](https://github.com/json-path/JsonPath) `subEntitiesJsonPath`.

`entityPreHooks` are executed before the delete operation, and they get the current entity as argument.
if any of the pre-hooks fails, the whole delete operation fails.

`postHook` is executed after the delete operation. If post-hook fails, the whole delete operation fails. A post-hook can be used
for example to notify other microservices about the operation.

Returns nothing or error.

#### <a name="removesubentityfromentitybyfilters"></a> removeSubEntityFromEntityByFilters

```ts
class AbstractDataStore {
  removeSubEntityFromEntityByFilters<T extends BackkEntity>(
    subEntityPath: string,
    subEntityId: string,
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

Finds an entity of class `EntityClass` matching filter(s) defined in `filters`, then removes sub-entity with id `subEntityId` from path `subEntityPath`.

`entityPreHooks` are executed before the delete operation, and they get the current entity as argument.
if any of the pre-hooks fails, the whole delete operation fails.

`postHook` is executed after the delete operation. If post-hook fails, the whole delete operation fails. A post-hook can be used
for example to notify other microservices about the operation.

Returns nothing or error.

#### <a name="removesubentitiesfromentitybyfilters"></a> removeSubEntitiesFromEntityByFilters

```ts
class AbstractDataStore {
  removeSubEntitiesFromEntityByFilters<T extends BackkEntity, U extends object>(
    subEntitiesJsonPath: string,
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

Finds an entity of class `EntityClass` matching filter(s) defined in `filters`, then removes sub-entities matching [JSON path](https://github.com/json-path/JsonPath) `subEntitiesJsonPath`.

`entityPreHooks` are executed before the delete operation, and they get the current entity as argument.
if any of the pre-hooks fails, the whole delete operation fails.

`postHook` is executed after the delete operation. If post-hook fails, the whole delete operation fails. A post-hook can be used
for example to notify other microservices about the operation.

Returns nothing or error.

#### <a name="addarrayfieldvaluestoentitybyid"></a> addArrayFieldValuesToEntityById

```ts
class AbstractDataStore {
  addArrayFieldValuesToEntityById<T extends BackkEntity>(
    arrayFieldName: keyof T & string,
    arrayFieldValuesToAdd: ArrayFieldValue[],
    EntityClass: { new (): T },
    _id: string,
    options?: {
      entityPreHooks?: EntityPreHook<T> | EntityPreHook<T>[];
      postQueryOperations?: PostQueryOperations;
      postHook?: PostHook<T>;
    }
  ): PromiseErrorOr<null>;
}

type ArrayFieldValue = string | number | boolean;
```

Finds an entity of class `EntityClass` by id `_id`, then adds values `arrayFieldValuesToAdd` to entity field `arrayFieldName`.

`entityPreHooks` are executed before the delete operation, and they get the current entity as argument.
if any of the pre-hooks fails, the whole delete operation fails.

`postHook` is executed after the delete operation. If post-hook fails, the whole delete operation fails. A post-hook can be used
for example to notify other microservices about the operation.

Returns nothing or error.

#### <a name="doesarrayfieldcontainvalueinentitybyid"></a> doesArrayFieldContainValueInEntityById

```ts
class AbstractDataStore {
  doesArrayFieldContainValueInEntityById<T extends BackkEntity>(
    arrayFieldName: keyof T & string,
    arrayFieldValue: ArrayFieldValue,
    EntityClass: { new (): T },
    _id: string
  ): PromiseErrorOr<boolean>;
}

type ArrayFieldValue = string | number | boolean;
```

Finds an entity of class `EntityClass` by id `_id`, then checks if `arrayFieldValue` exists in entity field `arrayFieldName`.

Returns true, false or error.

#### <a name="removearrayfieldvaluesfromentitybyid"></a> removeArrayFieldValuesFromEntityById

```ts
class AbstractDataStore {
  removeArrayFieldValuesFromEntityById<T extends BackkEntity>(
    arrayFieldName: keyof T & string,
    arrayFieldValuesToRemove: ArrayFieldValue[],
    EntityClass: { new (): T },
    _id: string,
    options?: {
      entityPreHooks?: EntityPreHook<T> | EntityPreHook<T>[];
      postQueryOperations?: PostQueryOperations;
      postHook?: PostHook<T>;
    }
  ): PromiseErrorOr<null>;
}

type ArrayFieldValue = string | number | boolean;
```

Finds an entity of class `EntityClass` by id `_id`, then removes values `arrayFieldValuesToRemove` from entity field `arrayFieldName`.

`entityPreHooks` are executed before the delete operation, and they get the current entity as argument.
if any of the pre-hooks fails, the whole delete operation fails.

`postHook` is executed after the delete operation. If post-hook fails, the whole delete operation fails. A post-hook can be used
for example to notify other microservices about the operation.

Returns nothing or error.

#### <a name="executeinsidetransaction"></a> executeInsideTransaction

```ts
class AbstractDataStore {
  executeInsideTransaction<T>(executable: () => PromiseErrorOr<T>): PromiseErrorOr<T>
}
```
Execute data store commands in `executable` inside a transaction.
