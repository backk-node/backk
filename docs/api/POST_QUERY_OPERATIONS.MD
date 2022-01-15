## Post Query Operations
Data store operations involving queries need post query operations to define what response fields are returned,
how returned entities are sorted and paginated.

```ts
interface PostQueryOperations extends Projection, SortBys {
  paginations?: Pagination[];
  currentPageTokens?: CurrentPageToken[];
}

interface Projection {
  includeResponseFields?: string[];
  excludeResponseFields?: string[];
}

interface SortBys {
  sortBys?: SortBy[];
}

class SortBy {
  subEntityPath?: string = '';
  
  @LengthAndMatches(1, Lengths._512, /^[a-zA-Z_][a-zA-Z0-9_.]*$/)
  fieldName!: string;

  // Ensure empty string when validating client input, NEVER allow sortExpression from client due to risk of SQL injection attack
  // sortExpression can be set only on server side, but never include client input to sort expression on server side
  // If you want client side to sort by an expression, you should create a new field in entity to store the sort expression result and allow client to sort by that field
  @MaxLength(0)
  sortExpression?: string;
  
  sortDirection!: 'ASC' | 'DESC';

  constructor(subEntityPath: string, fieldName: string, sortDirection: 'ASC' | 'DESC');
}

class Pagination {
  subEntityPath?: string = '';

  @MinMax(1, 100)
  pageNumber!: number;

  @MinMax(1, 100)
  pageSize!: number;

  constructor(subEntityPath: string, pageNumber: number, pageSize: number)
}

class CurrentPageToken {
  subEntityPath!: string;
  currentPageToken!: string;
}
```

When you need to supply post query operations for data store operation requiring them,
you can use an instance of `DefaultPostQueryOperationsImpl` as such if it is appropriate to your needs
or an instance of your own class that extends `DefaultPostQueryOperationsImpl`, but overrides one or more class members.

`DefaultPostQueryOperationsImpl` is defined as follows:

```ts
class DefaultPostQueryOperationsImpl implements PostQueryOperations {
  constructor(pageNumber: number = 1, pageSize: number = 50) {
    this.paginations = [new Pagination('*', pageNumber, pageSize)];
  }

  @ArrayMinSize(0)
  @ArrayMaxSize(500)
  @ArrayUnique()
  includeResponseFields?: string[] = [];

  @ArrayMinSize(0)
  @ArrayMaxSize(100)
  @ArrayUnique()
  excludeResponseFields?: string[] = [];

  @ArrayMinSize(0)
  @ArrayMaxSize(25)
  sortBys: SortBy[] = [new SortBy('*', '_id', 'ASC'), new SortBy('*', 'id', 'ASC')];

  @ArrayMinSize(0)
  @ArrayMaxSize(100)
  paginations: Pagination[];

  @ArrayMinSize(0)
  @ArrayMaxSize(100)
  currentPageTokens: CurrentPageToken[] = [];
}
```

If you are extending your service function argument class from `DefaultPostQueryOperationsImpl`, please note that there are some pre-defined validations
present, for example maximum page number and size is limited to 100 to prevent any DoS attacks. Without these, it would be
possible for clients to request for example a page number 100 million or page size 100 million.
If you need different validations, you should create a new class that extends `Pagination` class, but provides different
`@MinMax()`decorators for `pageNumber` and/or `pageSize` properties.

For example:

```ts
class MyPagination extends Pagination {
  subEntityPath?: string = '';

  @MinMax(1, 25)
  pageNumber!: number;
  
  pageSize!: 25 | 50;
}

class MyDefaultPostQueryOperations extends DefaultPostQueryOperationsImpl {
  @ArrayMinSize(0)
  @ArrayMaxSize(100)
  paginations: MyPagination[];
}
```

Sub-entity path defines the entity for which post query operation is dedicated.
Empty sub-entity path means the root entity and sub-entity path `'*'` means all sub-entity paths including the root entity.
Sub-entity path is given with dot notation, for example: `orders.orderItems`

`includeResponseFields` and `excludeResponseFields` specifies the field path names in dot notation.
For example:
```ts
const includeResponseFields = ['_id', 'orderItems._id']
```

If you specify only the name of the sub-entity, then all sub-entity fields will be automatically
included:
```ts
const includeResponseFields = ['_id', 'orderItems']
```

If the service function response includes current page token(s) in the `metadata` object of the response,
you need to supply the same tokens in the post query operations. This is needed in case of data store operation
allows only fetching current, next or previous page of data. There is a parameter in data store get-methods to specify
if the data store method should allow requesting only current, previous or next page of data. In many cases, it is useful
to limit page access to avoid excessive load and long-running queries for the database.

### <a name="graphql-json-support"></a> GraphQL and JSON support for including/excluding response fields

`includeResponseFields` and `excludeResponseFields` can contain a GraphQL query format string.
In case of GraphQL query string you, the `includeResponseFields` and `excludeResponseFields` arrays should contain only one element.
For example:

```
postQueryOperations.includeResponseFields = [`
{
  _id
  createdAtTimestamp
  orderItems {
    salesItems {
      _id
      title
    }
  }
}
`]
```

`includeResponseFields` and `excludeResponseFields` can contain a GraphQL query format string as JSON.
In case of JSON query string you, the `includeResponseFields` and `excludeResponseFields` arrays should contain only one element.
It is easier for clients to maintain query object as a plain JavaScript object instead of GraphQL query.
For example:

```
postQueryOperations.includeResponseFields = [JSON.stringfy(
{
  _id: true,
  createdAtTimestamp: true
  orderItems: {
    salesItems: {
      _id: true
      title: true
    }
  }
}
)];
```
