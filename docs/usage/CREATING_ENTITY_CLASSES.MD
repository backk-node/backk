## Creating Entity Classes

Entity classes must be annotated with the `@Entity()` decorator.
Entity class name will be the name of the table in database where entities are stored.

Root entity class should extend from one of the base classes available [here.](https://github.com/backk-node/backk/tree/main/src/types/_id)
Each root entity class must at least extend from `_Id` base class, because each root entity must have an `_id` property to identify each entity.
Each sub-entity class (i.e. non-root entity class) must extend from `Id` class, because each sub-entity must have an `id` property.
I.e. root entities have an `_id` property and sub-entities have an `id` property.

Entity class can contain one or more properties.
Entity class property names will be the names of the columns in entity database table.
Possible entity property types:
- `number`
- `boolean`
- `string`
- `Date`
- number or string union type, for example: `1 | 5 | 10` or `'forSale' | 'sold'`
- another entity type
- Arrays of above types
- Following nullable types:
  - `number | null`
  - `boolean | null`
  - `string | null`
  - `Date | null`
  - `<another-entity-type> | null`

If your entity class does not have a constructor, you need to define properties with
exclamation mark (!), because otherwise a TypeScript error is generated.

Example use of exclamation mark:
```ts
@Entity()
class MyEntity {
  someValue!: string;
}
```

Entity class can be a _logical entity_ class when a reference to another (physical) entity is given:

```ts
@Entity('UserAccount')
class FollowedUserAccount {
  // ...
}
```

In the above example `FollowedUserAccount` entity is a logical entity that is a reference to `UserAccount` entity.
This means that `FollowedUserAccount` entities are actually stored in the database table of physical entity `UserAccount`.
Separation between logical and physical entity is needed to avoid infinite recursion when defining nested entities.
The following example **is not valid** due to infinite recursion when `UserAccount` refers to itself:

```ts
import { BaseUserAccount } from 'backk';

@Entity()
class UserAccount extends BaseUserAccount {
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
class UserAccount extends BaseUserAccount {
  followedUserAccounts!: FollowedUserAccount[];
}
```

Number type properties must be annotated with one of following decorators, or otherwise an exception will be thrown:
- `IsInt()`
- `IsFloat()`
- `IsBigInt()`

String type properties must be annotated with one of the string validators or with `IsAnyString()` decorator, or otherwise an exception will be thrown.
String validation decorators are listed [here.](../api/DECORATORS.MD#validation-decorators)

String and integer type properties must be annotated with one of following to validate the uniqueness of values in the database,
or otherwise an exception will be thrown:
- `@Unique()`
- `@NotUnique()`

The possible value range of number type properties must be validated with following decorators, or otherwise an exception will be thrown:
- `@Min()` and `@Max()`
- `@MinMax()`

The maximum length of string type properties must be validated with following decorators, or otherwise an exception will be thrown:
- `@MaxLength()`
- `@Length()`

Each entity property having a sub-entity array type must have one of following decorators, or otherwise an exception will be thrown:
- `@OneToMany(isReferenceToExternalEntity = false)`
- `@ManyToMany()`

Example usage of `OneToMany()` versus `OneToMany(true)`:
```ts
@Entity()
export default class UserAccount extends BaseUserAccount {
  @OneToMany()
  @ReadWrite()
  paymentMethods!: PaymentMethod[];

  @OneToMany(true)
  @ReadOnly()
  ownSalesItems!: OwnSalesItem[];

  @OneToMany(true)
  @ReadOnly()
  orders!: Order[];
}
```

In above example `PaymentMethod` is an internal entity of user account service and service will create
necessary table structures to store payment methods. But `OwnSalesItem` and `Order` are external entities
which are managed by other services, sales item and order service, respectively. So the user account service does not create
any table structures neither for `OwnSalesItem` nor `Order`. In case the mapping between entity and sub-entity with `isReferenceToExternalEntity` set to `true`,
the mapping is done using ids. For example, the `_id` of `UserAccount` entity maps to `userAccountId` in the sub-entity.

There is no `@ManyToOne()` annotation, but it can be achieved with a combination of following 3 annotations:

```ts
@ManyToMany()
@ArrayMinSize(1)
@ArrayMaxSize(1)
```

Each array type property that IS NOT read-only must have the following decorators, or otherwise an exception will be thrown:
- `@ArrayMinSize()`
- `@ArrayMaxSize()`

Each entity property must be annotated with property access mode decorator, or otherwise an exception will be thrown.
Access mode defines how the property can be accessed by the microservice clients. Private properties cannot be accessed by clients
and read-write properties offer full access. Access mode decorators are:
- `@Private()`
- `@ReadWrite()`
- `@ReadOnly()`
- `@ReadUpdate()`
- `@WriteOnly()`
- `@CreateOnly()`
- `@UpdateOnly()`

Using entity access mode decorator helps you to avoid defining separate Data Transfer Objects (DTOs) in many cases.
Because you can use the entity class as service function argument and response type. Depending on each entity property's
access mode, entity property is either included or not in service function response or allowed to be either present or not in service function argument.

You can document entity property by writing a comment above it:

```ts
@Entity()
class MyEntity extends _Id {
  /* this is an example of property documentation */
  myProperty!: string;

  // this is an example of property documentation
  myProperty2!: string;
}
```

### Indexing

#### Composite Index

Composite index can be defined for entity class with `CompositeIndex` or `UniqueCompositeIndex` decorator.
For example:

```ts
@Entity()
@CompositeIndex(['myProperty', 'myProperty2'])
// The above is same as @CompositeIndex(['myProperty', 'myProperty2'], 'ASC')
class MyEntity extends _Id {
  myProperty!: string;
  myProperty2!: string;
}
```

#### Property index

Property can be indexed with `Indexed` decorator.
For example:

```ts
@Entity()
class MyEntity extends _Id {
  @Indexed() // This is same as @Indexed('ASC')
  myProperty!: string;
  
  @Indexed('DESC')
  myProperty2!: string;
}
```

### Defining Entity Class Using Property Composition
You can make an entity class by composing its properties of one or more properties of another entity class.
To take advantage of this feature, you need to declare the entity class in special `.type` file.

Below is an example of composing `FollowedUserAccount` entity class of some properties of `UserAccount` entity class:

FollowedUserAccount.type

```ts
class FollowedUserAccount {
  ...Pick<UserAccount, '_id' | 'displayName' | 'city' | 'imageDataUri' | 'ownSalesItems'>;
}
```

In the above example, `FollowedUserAccount` class is composed by picking following properties from `UserAccount` class:
- `_id`
- `displayName`
- `city`
- `imageDataUri`
- `ownSalesItems`

You need to generate the `.ts` files from `.type` files by executing following command:

```bash
npm run generateTypes
```

If your .type file(s) have changed or some of the files that .type file references have changed, and
you try to start the microservice in dev environment (`npm run start:dev`), you will get an error where it is instructed that `npm run generateTypes`
must be run to re-generate types before trying to start the microservice.

Possible operations for class property composition:

| Operation                                                                                        | Description                                                                                         |
| ------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------- |
| <code>...Pick<OtherEntityClass, 'propertyName1' &#124; 'propertyName2' ...>;</code>              | Picks the listed properties from `OtherEntityClass`                                                 |
| <code>...Omit<OtherEntityClass, 'propertyName1' &#124; 'propertyName2' ...>;</code>              | Picks all except the listed properties from `OtherEntityClass`                                      |
| <code>...OtherEntityClass;</code>                                                                | Picks all properties from `OtherEntityClass`                                                        |
| <code>...Private<Pick<OtherEntityClass, 'propertyName1' &#124; 'propertyName2' ...>>;</code>     | Picks the listed properties from `OtherEntityClass` and annotates them with `@Private` decorator    |
| <code>...ReadWrite<Pick<OtherEntityClass, 'propertyName1' &#124; 'propertyName2' ...>>;</code>   | Picks the listed properties from `OtherEntityClass` and annotates them with `@RreadWrite` decorator |
| <code>...ReadOnly<Pick<OtherEntityClass, 'propertyName1' &#124; 'propertyName2' ...>>;</code>    | Picks the listed properties from `OtherEntityClass` and annotates them with `@ReadOnly` decorator   |
| <code>...NonNullable<Pick<OtherEntityClass, 'propertyName1' &#124; 'propertyName2' ...>>;</code> | Picks the listed properties from `OtherEntityClass` and makes the non-nullable                      |
