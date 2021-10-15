## AbstractDataStore

- [Create Entities](CREATE_ENTITIES.MD)
- [Get Entities](GET_ENTITIES.MD)
- [Update Entities](UPDATE_ENTITIES.MD)
- [Delete Entities](DELETE_ENTITIES.MD)
- [Add Sub-entities](ADD_SUBENTITIES.MD)
- [Remove Sub-entities](REMOVE_SUBENTITIES.MD)
- [Add/Check/Remove Entity Array Field Values](ENTITY_ARRAYS.MD)
- [Query Filters](QUERY_FILTERS.MD)
- [Post Query Operations](POST_QUERY_OPERATIONS.MD)
- [executeInsideTransaction](#executeinsidetransaction)

### <a name="executeinsidetransaction"></a> executeInsideTransaction

```ts
class AbstractDataStore {
  executeInsideTransaction<T>(executable: () => PromiseErrorOr<T>): PromiseErrorOr<T>
}
```
Execute data store commands in `executable` inside a transaction.
