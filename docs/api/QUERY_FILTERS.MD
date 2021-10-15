## Query Filters

Some of the `AbstractDataStore` require query filters.
Query filters are defined using following types:

```ts
filters: Array<MongoDbQuery<T> | SqlExpression | UserDefinedFilter> | Partial<T> | object
```

### Common Equality Filters

Common equality filters can be used with both MongoDB and SQL databases.
These filters can use sub-entity paths to access fields in sub-entities.
Example of such filter:

```ts
const filters = {
  _id: userAccountId,
  'followedUserAccounts.ownSalesItems.state': 'forSale'
};
```

### MongoDB Specific Filters

```ts
import { FilterQuery } from 'mongodb';

class MongoDbQuery<T> {
  subEntityPath: string;
  filterQuery: FilterQuery<T>;
  constructor(filterQuery: FilterQuery<T>, subEntityPath?: string);
}
```

`subEntityPath` defines the entity for which the filter is dedicated.
Empty sub-entity path means the root entity.
Sub-entity path is given with dot notation, for example: `orders.orderItems`

For syntax of `filterQuery`, check [MongoDB documentation for query filter](https://docs.mongodb.com/manual/tutorial/query-documents/).

Example of a filter query:

```ts
{
  $or: [{ title: new RegExp(textFilter) }, { description: new RegExp(textFilter) }];
}
```

### SQL Database Specific Filters

```ts
class SqlExpression {
  constructor(sqlExpression: string, values?: object, subEntityPath = '');
}
```

`sqlExpression` is any valid SQL expression that can be used in SQL WHERE clause in a prepared statement.
It can contain named parameters. Named parameters start with a colon, e.g. `:namedParameter`.

`values` is an object of values for named parameters in given `sqlExpression`

Examples:

```ts
const filters = [
  new SqlExpression('name LIKE :nameSubString', {
    nameSubString: nameSubString ? `%${nameSubString}%` : undefined
  }),
  new SqlExpression('price >= :minPrice', { minPrice }),
  new SqlExpression('price <= :maxPrice', { maxPrice })
];
```

`subEntityPath` defines the entity for which the filter is dedicated.
Empty sub-entity path means the root entity.
Sub-entity path is given with dot notation, for example: `orders.orderItems`

```ts
class SqlEquals<T> extends SqlExpression {
  constructor(filters: Partial<T>, subEntityPath: string = '');
}

class SqlInExpression extends SqlExpression {
  constructor(fieldName: string, inExpressionValues?: any[], subEntityPath = '', fieldExpression?: string);
}

class SqlNotInExpression extends SqlExpression {
  constructor(fieldName: string, notInExpressionValues?: any[], subEntityPath = '', fieldExpression?: string);
}
```

Below example of `SqlEquals` will check that root entity's `transactionId` field is NULL:

```ts
new SqlEquals({ transactionId: null });
```

Below example of `SqlInExpression` will check that root entity's `_id` field has one of the values given in `salesItemIds`

```ts
new SqlInExpression('_id', salesItemIds);
```
