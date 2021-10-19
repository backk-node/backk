## Create Entities

- [createEntity](#createentity)
- [createEntities](#createEntities)

### <a name="createentity"></a> createEntity

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

### <a name="createentity"></a> createEntities

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