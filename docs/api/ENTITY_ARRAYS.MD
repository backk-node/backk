## Add/Check/Remove Entity's Primitive Array Field Values

- [addArrayFieldValuesToEntityById](#addarrayfieldvaluestoentitybyid)
- [doesArrayFieldContainValueInEntityById](#doesarrayfieldcontainvalueinentitybyid)
- [removeArrayFieldValuesFromEntityById](#removearrayfieldsvaluesfromentitybyid)

### <a name="addarrayfieldvaluestoentitybyid"></a> addArrayFieldValuesToEntityById

```ts
interface DataStore {
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

### <a name="doesarrayfieldcontainvalueinentitybyid"></a> doesArrayFieldContainValueInEntityById

```ts
interface DataStore {
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

### <a name="removearrayfieldvaluesfromentitybyid"></a> removeArrayFieldValuesFromEntityById

```ts
interface DataStore {
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
