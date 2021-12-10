## Hooks

Hooks are operations performed before or after a data store operation.

- [Pre-Hooks](#pre-hooks)
- [Entity Pre-Hooks](#entity-pre-hooks)
- [Post-Hook](#post-hook)
- [Entities Post-Hook](#entities-post-hook)

### <a name="pre-hooks"></a>Pre-Hooks

```ts
export type PreHook<> =
  | {
      executePreHookIf?: () => boolean | Promise<boolean> | PromiseErrorOr<boolean>;
      shouldSucceedOrBeTrue: () =>
        | PromiseErrorOr<Many<BackkEntity> | One<BackkEntity> | null>
        | Promise<boolean | BackkError | null | undefined | void>
        | boolean;
      error?: ErrorDef;
    }
  | (() =>
      | PromiseErrorOr<boolean | Many<BackkEntity> | One<BackkEntity> | null>
      | Promise<boolean | BackkError | null | undefined | void>
      | boolean);
```

### <a name="entity-pre-hooks"></a>Entity Pre-Hooks

```ts
export type EntityPreHook<T extends BackkEntity | SubEntity> =
  | {
  executePreHookIf?: (entity: T) => boolean | Promise<boolean> | PromiseErrorOr<boolean>;
  shouldSucceedOrBeTrue: (entity: T) =>
    | PromiseErrorOr<One<BackkEntity> | Many<BackkEntity> | null>
    | Promise<boolean | BackkError | null | undefined>
    | boolean;
  error?: BackkError;
}
  | ((entity: T) =>
  | PromiseErrorOr<boolean | Many<BackkEntity> | One<BackkEntity> | null>
  | Promise<boolean | BackkError | null | undefined>
  | boolean);
```

### <a name="post-hook"></a>Post-Hook

```ts
export type PostHook<T extends BackkEntity | SubEntity> =
  | {
      executePostHookIf?: (entity: T | null) => boolean;
      shouldSucceedOrBeTrue: (
        entity: T | null
      ) => PromiseErrorOr<One<BackkEntity> | null> | Promise<boolean> | boolean;
      error?: BackkError;
    }
  | ((entity: T | null) => PromiseErrorOr<One<BackkEntity> | null> | Promise<boolean> | boolean);
```

### <a name="entities-post-hook"></a>Entities Post-Hook

```ts
export type EntitiesPostHook<T extends BackkEntity | SubEntity> =
  | {
  executePostHookIf?: (entity: T[] | null) => boolean;
  shouldSucceedOrBeTrue: (
    entity: T[] | null
  ) => PromiseErrorOr<One<BackkEntity> | null> | Promise<boolean> | boolean;
  error?: BackkError;
}
  | ((entity: T[] | null) => PromiseErrorOr<One<BackkEntity> | null> | Promise<boolean> | boolean);

```
