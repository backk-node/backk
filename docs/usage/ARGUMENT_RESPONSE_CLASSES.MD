## Creating Service Function Argument and Response Classes

Service function argument or response class can contain one or more properties.
Possible property types are:

- `number`
- `boolean`
- `string`
- number or string union type, for example: `1 | 5 | 10` or `'forSale' | 'sold'`
- another entity type
- Arrays of above types

Number type properties must be annotated with one of following decorators otherwise an exception will be thrown:

- `IsInt()`
- `IsFloat()`
- `IsBigInt()`

String type properties must be annotated with one of the string validators or with `IsAnyString()` decorator, otherwise an exception will be thrown.

The possible value range of number type properties must be validated with following decorators or an exception will be thrown:

- `@Min()` and `@Max()`
- `@MinMax()`

The maximum lenght of string type properties must validated with following decorators or an exception will be thrown:

- `@MaxLength()`
- `@Length()`

Each array type property must have the following decorators or an exception will be thrown:

- `@ArrayMinSize()`
- `@ArrayMaxSize()`

You can document class property by writing a comment above it:

```ts
class MyClass {
  /* this is an example of property documentation */
  myProperty!: string;

  // this is an example of property documentation
  myProperty2!: string;
}
```

### Class Property Composition

You can make a class by composing its properties of one or more properties of another class.
To take advantage of this feature, you need to declare the class in special `.type` file.

Below is an example of composing `PayOrderArg` service function argument class of some properties of `Order` entity class:

PayOrderArg.type

```ts
class PayOrderArg {
...NonNullable<Pick<Order, '_id' | 'paymentGateway' | 'transactionId' | 'transactionTimestamp' | 'paymentAmount'>>
}
```

In the above example, `PayOrderArg` class is composed by picking following properties from `Order` class and making then non-nullable:

- `_id`
- `paymentGateway`
- `transactionId`
- `transactionTimestamp`
- `paymentAmount`

You need to generate the `.ts` files from `.type` files by executing following command:

```bash
npm run generateTypes
```

Possible operations for class property composition:

| Operation                                                                                  | Description                                                              |
| ------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------ |
| <code>...Pick<OtherClass, 'propertyName1' &#124; 'propertyName2' ...>;</code>              | Picks the listed properties from `OtherClass`                            |
| <code>...Omit<OtherClass, 'propertyName1' &#124; 'propertyName2' ...>;</code>              | Picks all except the listed properties from `OtherClass`                 |
| <code>...OtherClass;</code>                                                                | Picks all properties from `OtherClass`                                   |
| <code>...NonNullable<Pick<OtherClass, 'propertyName1' &#124; 'propertyName2' ...>>;</code> | Picks the listed properties from `OtherClass` and makes the non-nullable |
| <code>...Partial<Pick<OtherClass, 'propertyName1' &#124; 'propertyName2' ...>>;</code>     | Picks the listed properties from `OtherClass` and makes them optional    |
