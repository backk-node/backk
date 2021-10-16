## Creating Entity Classes

Entity classes must be annotated with the `@Entity()` decorator.
Entity class name will be the name of the table in database where entities are stored.

Entity class can contain one or more properties of following type:
- `number`
- `boolean`
- `string`
- number or string union type, for example: `1 | 5 | 10` or `'forSale' | 'sold'`
- another entity type
- Arrays of above types

Entity class can be a _logical entity_ class when a reference to another (physical) entity is given:
```ts
@Entity('UserAccount')
class FollowedUserAccount {
  // ...
}
```

In the above example `FollowedUserAccount` entity is a logical entity that is a reference to `UserAccount` entity.
This means that `FollowedUserAccount` entities are actually stored in the database table of physical entity `UserAccount`.
Separation between logical and physical entity is needed to avoid infinite recursion.
The following example is not valid due to infinite recursion:

```ts
@Entity()
class UserAccount {
  followedUserAccounts!: UserAccount[];
}
```

But this is valid:
```ts
@Entity('UserAccount')
class FollowedUserAccount {
  // ...
}

@Entity()
class UserAccount {
  followedUserAccounts!: FollowedUserAccount[];
}
```

Number type properties must be annotated with one of following decorators otherwise an exception will be thrown:
-`IsInt()`
-`IsFloat()`
-`IsBigInt()`

String type properties must be annotated with one of the string validators or with `IsAnyString()` decorator, otherwise an exception will be thrown.

String and integer type properties must be annotated with one of following to validate the uniqueness of values in the database,
otherwise an execption will be thrown:
-`@Unique()`
-`@NotUnique()`

The possible value range of number type properties must be validated with following decorators or an exception will be thrown:
-`@Min()` and `@Max()`
-`@MinMax()`

The maximum lenght of string type properties must validated with following decorators or an exception will be thrown:
-`@MaxLength()`
-`@Length()`


