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
  constructor(subEntityPath: string, fieldName: string, sortDirection: 'ASC' | 'DESC');
  subEntityPath?: string = '';
  fieldName!: string;
  sortDirection!: 'ASC' | 'DESC';
}

class Pagination {
  subEntityPath?: string = '';
 
  @MinMax(1, 100)
  pageNumber!: number;

  @MinMax(1, 100)
  pageSize!: number;
}

class CurrentPageToken {
  subEntityPath!: string;
  currentPageToken!: string;
}
```

When you need to supply post query operations for data store operation requiring them,
you can use an instance of `DefaultPostQueryOperations` as such if it is appropriate
or an instance of your own class that extends `DefaultPostQueryOperations`, but overrides one or more class members.

You can of course use an instance of any class that implements the `PostQueryOperations` interface.

If you are extending your service function argument class from `DefaultPostQueryOperations`, please note that there are some pre-defined validations
present, for example maximum page number and size is limited to 100 to prevent any DoS attacks. Without these, it would be
possible for clients to request for example a page number 100,000,000 with page size 100,000,000,000.

```ts
class DefaultPostQueryOperations implements PostQueryOperations {
  constructor(pageNumber: number = 1, pageSize: number = 50) {
    this.paginations = [new Pagination('*', 1, pageSize)]
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
  currentPageTokens: CurrentPageToken[] = []
}
```

Sub-entity path defines the entity for which post query operation is dedicated.
Empty sub-entity path means the root entity and sub-entity path `'*'` means all sub-entity paths including the root entity.
Sub-entity path is given with dot notation, for example: `orders.orderItems`
