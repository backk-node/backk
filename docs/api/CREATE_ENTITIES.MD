## Create Entities

- [createEntity](#createentity)
- [createEntities](#createEntities)

### <a name="createentity"></a> createEntity

```ts
interface DataStore {
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
`postHook` is executed after successful create operation. If post-hook fails, the whole create operation fails.
`postQueryOperations` are applied to query that returns the just created entity.

Returns the created entity or error.

### <a name="createEntities"></a> createEntities

```ts
interface DataStore {
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

`preHooks` are executed before each create operation and if any of the pre-hooks fails, the whole create operation fails.
`postHook` is executed after each successful create operation. If post-hook fails, the whole create operation fails.
`postQueryOperations` are applied to each query that returns the just created entity.

Returns the created entities or error.
