## Data Store

- [Creating a Data Store](#creating-data-store)
- [Data Store Methods](#methods)
- [Query Filters](#query-filters)
- [Post Query Operations](#post-query-operations)
  - [GraphQL/JSON support](#graphql-json-support)

### <a name="creating-data-stores></a> Creating a Data Store

Your microservice's data store should be created in `microservice.ts` file, for example:

```ts
import { MySqlDataStore } from 'backk';

const dataStore = new MySqlDataStore();

class MicroserviceImpl extends Microservice {
  // ...
}
```

Backk provides following data stores out of the box:

- `MySqlDataStore`
- `PostgreSqlDataStore`
- `MongoDbDataStore`

In addition to above data stores, Backk provides `NullDataStore` which is intended to use when writing unit tests.

Data store connection parameters are defined with following environment variables:

| Environment Variable | Description                                 |
| -------------------- | ------------------------------------------- |
| MYSQL_HOST           | Hostname or IP address of MySQL server      |
| MYSQL_PORT           | IP port of MySQL server                     |
| MYSQL_USER           | MySQL server user name                      |
| MYSQL_PASSWORD       | MySQL server user's password                |
| POSTGRESQL_HOST      | Hostname or IP address of PostgreSQL server |
| POSTGRESQL_PORT      | IP port of PostgreSQL server                |
| POSTGRESQL_USER      | PostgreSQL server user name                 |
| POSTGRESQL_PASSWORD  | PostgreSQL server user's password           |
| MONGODB_HOST         | Hostname or IP address of MongoDB server    |
| MONGODB_PORT         | IP port of MongoDB server                   |
| MONGODB_USER         | MongoDB server user name                    |
| MONGODB_PASSWORD     | MongoDB server user's password              |

### <a name="methods></a> Methods

Data store provide following method groups for fetching or manipulating entities in data store:

- [Create Entities](../api/CREATE_ENTITIES.MD)
- [Get Entities](../api/GET_ENTITIES.MD)
- [Update Entities](../api/UPDATE_ENTITIES.MD)
- [Delete Entities](../api/DELETE_ENTITIES.MD)
- [Add Sub-Entities](../api/ADD_SUBENTITIES.MD)
- [Remove Sub-Entities](../api/REMOVE_SUBENTITIES.MD)
- [Add/Check/Remove Entity's Primitive Array Field Values](../api/ENTITY_ARRAYS.MD)

If you are using multiple of the manipulating data store methods inside a single service function call,
Backk will throw an exception, unless those method calls are wrapped in [`executeInsideTransaction`](../api/ABSTRACT_DATA_STORE.MD#executeinsidetransaction) call.

Typically, you won't directly manipulate entity's sub-entity arrays or primitive value arrays, but use following methods instead:

- [Add Sub-Entities](../api/ADD_SUBENTITIES.MD)
- [Remove Sub-Entities](../api/REMOVE_SUBENTITIES.MD)
- [Add/Check/Remove Entity's Primitive Array Field Values](../api/ENTITY_ARRAYS.MD)

### <a name="query-filters></a> Query Filters
When you need to filter the entities queried from the data store, you can use [Query Filters](../api/QUERY_FILTERS.MD).
With query filters you can filter both root entities and their sub-entities.

### <a name="post-query-operations"></a> Post Query Operations
Every data store operation involving querying entities requires/allows to provide [post query operations](../api/POST_QUERY_OPERATIONS.MD).
Backk offers also [GraphQL/JSON query style support](../api/POST_QUERY_OPERATIONS.MD#graphql-json-support) for specifying what fields should be included in query response.


#### <a name="graphql-json-support></a> GraphQL/JSON support
