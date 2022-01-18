## Execute Custom SQL Operation

By default, custom SQL operation should be avoided, if possible. They open up a possibility to accidentally
craft vulnerable code (SQL injection attacks). Prefer to find a suitable existing data store method or create
a new feature request for Backk, so that we can enhance an existing Backk data store method or create a totally
new method. Also, when using custom SQL operations, you make your code non-portable to use another type of data store.

### executeSqlOrThrow

```ts
interface DataStore {
  executeSqlOrThrow<T>(sqlStatement: string, values?: any[], shouldReportError = true): Promise<Field[]>;
}
```

Executes `sqlStatement` with placeholder values given in `values` array.
Use this function for DDL/DML statement like INSERT, UPDATE and DELETE.
You can put placeholders in `sqlStatement` with `?` symbol. For example:

```sql
INSERT INTO salesitem (name, price) VALUES (?, ?)
```

Returns fields or on error throws an exception.

### executeSqlQueryOrThrow

**NOTE! This method can throw an exception**

```ts
interface DataStore {
  executeSqlQueryOrThrow<T>(sqlStatement: string, values?: any[]): Promise<any>;
}
```

Executes an SQL query given in `sqlStatement` with placeholder values given in `values` array.
Use this function for DQL statement like SELECT.
You can put placeholders in `sqlStatement` with `?` symbol. For example:

```sql
SELECT name, price FROM salesitem WHERE price > ?
```
