## Query Filters

Query filters are defined as follows:

```ts
type QueryFilters<T> = CommonEqFilters<T> | Array<MongoDbFilter<T> | SqlFilter | UserDefinedFilter>
type CommonEqFilters<T> = Partial<T> | object
```

[Common Equality Filters](#common-equality-filters)
[MongoDB Specific Filters](#mongodb-specific-filters)
[Sql Specific Filters](#sql-specific-filters)
[User Defined Filters](#user-defined-filters)

### <a name="common-equality-filters"></a> Common Equality Filters

Common equality filters can be used with both MongoDB and SQL databases.
These filters can use sub-entity paths to access fields in sub-entities.
Example of such filters:

```ts
const filters: CommonFilters = {
  _id: userAccountId,
  'followedUserAccounts.ownSalesItems.state': 'forSale'
};

type CommonFilters = Partial<T> | object
```

### <a name="mongodb-specific-filters"></a> MongoDB Specific Filters

```ts
import { FilterQuery } from 'mongodb';

class MongoDbFilter<T> {
  constructor(filterQuery: FilterQuery<T>, subEntityPath?: string);
}
```

`subEntityPath` defines the entity for which the filter is dedicated.
Empty sub-entity path means the root entity.
Sub-entity path is given with dot notation, for example: `orders.orderItems`

For syntax of `filterQuery`, check [MongoDB documentation for query filter](https://docs.mongodb.com/manual/tutorial/query-documents/).

Example of query filter with one instance of `MongoDbFilter`:

```ts
const filters = [
  new MongoDbFilter({ 
    _id: { $in: salesItemIds },
    state: currentStateFilter,
    buyerUserAccountId: buyerUserAccountIdFilter,
  })
];
```

### <a name="sql-specific-filters"></a> SQL Specific Filters

```ts
class SqlFilter {
  constructor(sqlExpression: string, values?: object, subEntityPath = '');
}
```

`sqlExpression` is any valid SQL expression that can be used in SQL WHERE clause in a prepared statement.
It can contain named parameters. Named parameters start with a colon, e.g. `:namedParameter`.

`values` is an object of values for named parameters in given `sqlExpression`

Example:

```ts
const filters = [
  new SqlFilter('name LIKE :nameSubString', {
    nameSubString: nameSubString ? `%${nameSubString}%` : undefined
  }),
  new SqlFilter('price >= :minPrice', { minPrice }),
  new SqlFilter('price <= :maxPrice', { maxPrice })
];
```

`subEntityPath` defines the entity for which the filter is dedicated.
Empty sub-entity path means the root entity.
Sub-entity path is given with dot notation, for example: `orders.orderItems`

Following subclasses of `SqlFilter` are also available:

```ts
class SqlEquals<T> extends SqlFilter {
  constructor(filters: Partial<T>, subEntityPath: string = '');
}

class SqlInFilter extends SqlFilter {
  constructor(fieldName: string, values?: any[], subEntityPath = '', fieldExpression?: string);
}

class SqlNotInFilter extends SqlFilter {
  constructor(fieldName: string, values?: any[], subEntityPath = '', fieldExpression?: string);
}
```

Below example of `SqlEquals` will check that root entity's `transactionId` field is NULL:

```ts
new SqlEquals({ transactionId: null });
```

Below example of `SqlInFilter` will check that root entity's `_id` field has one of the values given in `salesItemIds`

```ts
new SqlInFilter('_id', salesItemIds);
```

### <a name="user-defined-filters"></a> User Defined Filters

User defined filters are filters that clients can specify in service function call arguments.

Example of using user defined filters to query sales items:

```ts
class SalesItemServiceImpl extends CrudEntityService {
 getSalesItemsByUserDefinedFilters(
   { filters }: GetSalesItemsByUserDefinedFiltersArg
  ): PromiseErrorOr<Many<SalesItem>> {
   return this.dataStore.getEntitiesByFilters(SalesItem, filters, new DefaultPostQueryOperations(), false);
 }
}

class GetSalesItemsByUserDefinedFiltersArg {
  @ArrayMinSize(1)
  @ArrayMaxSize(10)
  @TestValue([
    {
      fieldName: 'title',
      operator: '=',
      value: 'abc'
    }
  ])
  filters!: UserDefinedFilter[];
}
```

```ts
class UserDefinedFilter {
  subEntityPath?: string = '';
  fieldName?: string;

  fieldFunction?:
    | 'ABS'
    | 'CEILING'
    | 'FLOOR'
    | 'ROUND'
    | 'LENGTH'
    | 'LOWER'
    | 'LTRIM'
    | 'RTRIM'
    | 'TRIM'
    | 'UPPER'
    | 'DAY'
    | 'HOUR'
    | 'MINUTE'
    | 'MONTH'
    | 'QUARTER'
    | 'SECOND'
    | 'WEEK'
    | 'WEEKDAY'
    | 'YEAR';

  operator?:
    | '='
    | '!='
    | '>'
    | '<'
    | '>='
    | '<='
    | 'IN'
    | 'NOT IN'
    | 'LIKE'
    | 'NOT LIKE'
    | 'IS NULL'
    | 'IS NOT NULL'
    | 'OR';

  value: any;

  orFilters?: OrFilter[];
}

class OrFilter {
  fieldName!: string;

  fieldFunction?:
    | 'ABS'
    | 'CEILING'
    | 'FLOOR'
    | 'ROUND'
    | 'LENGTH'
    | 'LOWER'
    | 'LTRIM'
    | 'RTRIM'
    | 'TRIM'
    | 'UPPER'
    | 'DAY'
    | 'HOUR'
    | 'MINUTE'
    | 'MONTH'
    | 'QUARTER'
    | 'SECOND'
    | 'WEEK'
    | 'WEEKDAY'
    | 'YEAR';

  operator?:
    | '='
    | '!='
    | '>'
    | '<'
    | '>='
    | '<='
    | 'IN'
    | 'NOT IN'
    | 'LIKE'
    | 'NOT LIKE'
    | 'IS NULL'
    | 'IS NOT NULL'
    | 'OR';

  value: any;
}
```
It is not possible to query entity fields that don't have read access mode specified.

If you want to limit the queried fields, you can extend the `UserDefinedFilter` class:

```ts
class SalesItemUserDefinedFilter extends UserDefinedFilter {
  subEntityPath?: string = '';
  fieldName?: 'title' | 'description';
}

class GetSalesItemsByUserDefinedFiltersArg {
  @ArrayMinSize(1)
  @ArrayMaxSize(10)
  @TestValue([
    {
      fieldName: 'title',
      operator: '=',
      value: 'abc'
    }
  ])
  filters!: SalesItemUserDefinedFilter[];
}
```
