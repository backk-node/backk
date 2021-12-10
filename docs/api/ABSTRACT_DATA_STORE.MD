## DataStore

- [Create Entities](CREATE_ENTITIES.MD)
- [Get Entities](GET_ENTITIES.MD)
- [Update Entities](UPDATE_ENTITIES.MD)
- [Delete Entities](DELETE_ENTITIES.MD)
- [Add Sub-Entities](ADD_SUBENTITIES.MD)
- [Remove Sub-Entities](REMOVE_SUBENTITIES.MD)
- [Add/Check/Remove Entity's Primitive Array Field Values](ENTITY_ARRAYS.MD)
- [Hooks](HOOKS.MD)
- [Query Filters](QUERY_FILTERS.MD)
- [Post Query Operations](POST_QUERY_OPERATIONS.MD)
- [executeInsideTransaction](#executeinsidetransaction)

### <a name="executeinsidetransaction"></a> executeInsideTransaction

```ts
interface DataStore {
  executeInsideTransaction<T>(executable: () => PromiseErrorOr<T>): PromiseErrorOr<T>
}
```
Executes data store operations in `executable` inside a transaction.
