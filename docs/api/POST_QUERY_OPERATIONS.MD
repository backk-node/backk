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
ou can use an instance of `DefaultPostQueryOperations` as such if it is appropriate
or an instance of your own class that extends `DefaultPostQueryOperations`, but overrides one or more class members.

You can of course use an instance of any class that implements the `PostQueryOperations` interface

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
