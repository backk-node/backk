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

In addition to above data stores, Backk provides `NullDataStore` which is intended to be used when no actual data store is used or when writing unit tests.

Data store connection parameters are defined with following environment variables:

| Environment Variable           | Description                                                                                                                                           |
|--------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------|
| MYSQL_HOST                     | Hostname or IP address of MySQL server                                                                                                                |
| MYSQL_PORT                     | IP port of MySQL server                                                                                                                               |
| MYSQL_USER                     | MySQL server user name                                                                                                                                |
| MYSQL_PASSWORD                 | MySQL server user's password                                                                                                                          |
 | MYSQL_TLS_CA_FILE_PATH_NAME    | Full path name of file containing PEM encoded CA certificates to trust                                                                                |
 | MYSQL_TLS_CERT_FILE_PATH_NAME  | Full path name of file containing PEM encoded certificate (for mTLS)                                                                                  |
| MYSQL_TLS_KEY_FILE_PATH_NAME   | Full path name of file containing PEM encoded private key  (for mTLS)                                                                                 |
| POSTGRESQL_HOST                | Hostname or IP address of PostgreSQL server                                                                                                           |
| POSTGRESQL_PORT                | IP port of PostgreSQL server                                                                                                                          |
| POSTGRESQL_USER                | PostgreSQL server user name                                                                                                                           |
| POSTGRESQL_PASSWORD            | PostgreSQL server user's password                                                                                                                     |
 | POSTGRES_TLS_CA_FILE_PATH_NAME | Full path name of file containing PEM encoded CA certificates to trust                                                                                |
| POSTGRES_TLS_CERT_FILE_PATH_NAME| Full path name of file containing PEM encoded certificate (for mTLS)                                                                                  |
 | POSTGRES_TLS_KEY_FILE_PATH_NAME | Full path name of file containing PEM encoded private key  (for mTLS)                                                                                 |
| MONGODB_HOST                   | Hostname or IP address of MongoDB server                                                                                                              |
| MONGODB_PORT                   | IP port of MongoDB server                                                                                                                             |
| MONGODB_USER                   | MongoDB server user name                                                                                                                              |
| MONGODB_PASSWORD               | MongoDB server user's password                                                                                                                        |
 | MONGODB_TLS_CA_FILE_PATH_NAME | Full path name to file containing PEM encoded CA certificates to trust                                                                                |
 | MONGODB_TLS_CERT_KEY_FILE_PATH_NAME | Full path name of the client certificate file or the client private key file, in the case that they both are needed, the files should be concatenated |

### <a name="methods></a> Data Store Methods

Data store provide following method groups for fetching or manipulating entities in data store:

- [Create Entities](../api/CREATE_ENTITIES.MD)
- [Get Entities](../api/GET_ENTITIES.MD)
- [Update Entities](../api/UPDATE_ENTITIES.MD)
- [Delete Entities](../api/DELETE_ENTITIES.MD)
- [Add Sub-Entities](../api/ADD_SUBENTITIES.MD)
- [Remove Sub-Entities](../api/REMOVE_SUBENTITIES.MD)
- [Add/Check/Remove Entity's Primitive Array Field Values](../api/ENTITY_ARRAYS.MD)
- [Execute Custom SQL Operation](../api/EXECUTE_CUSTOM_SQL.MD)
- [Execute Custom MongoDB Operation](../api/EXECUTE_CUSTOM_SQL.MD)

If you are using multiple of the manipulating data store methods inside a single service function call,
Backk will throw an exception, unless those method calls are wrapped in [`executeInsideTransaction`](../api/ABSTRACT_DATA_STORE.MD#executeinsidetransaction) call.

In many cases, you should not directly manipulate entity's sub-entity arrays or primitive value arrays, but use following methods instead:

- [Add Sub-Entities](../api/ADD_SUBENTITIES.MD)
- [Remove Sub-Entities](../api/REMOVE_SUBENTITIES.MD)
- [Add/Check/Remove Entity's Primitive Array Field Values](../api/ENTITY_ARRAYS.MD)

The above methods are performance optimized to add/remove items from arrays without the need to replace the whole array.
For example, if you have a Shopping Cart service, you can have service functions to add and remove item from a shopping cart,
and those service function can use Add sub-entities and Remove sub-entities methods of the Data Store interface.

If you want to know what SQL statement each Data Store method is generating, you should enable debug level logging.
This can be done by changing the `LOG_LEVEL` environment variable to value `DEBUG` in `.env.dev` file.

### <a name="query-filters></a> Query Filters
When you need to filter the entities queried from the data store, you can use [Query Filters](../api/QUERY_FILTERS.MD).
With query filters you can filter both root entities and their sub-entities.

### <a name="post-query-operations"></a> Post Query Operations
Every data store operation involving querying entities requires [Post Query Operations](../api/POST_QUERY_OPERATIONS.MD) to be provided.
Post query operations defines which properties are returned and the sorting and pagination of the data.

#### <a name="graphql-json-support></a> GraphQL/JSON support
Backk offers also [GraphQL/JSON query style support](../api/POST_QUERY_OPERATIONS.MD#graphql-json-support) for specifying what fields should be included in the response.

