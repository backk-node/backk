## Execute Custom MongoDB Operation

### tryExecute

**NOTE! This method can throw an exception**

```ts
interface DataStore {
  tryExecute<T>(
    shouldUseTransaction: boolean,
    executeDbOperations: (client: MongoClient) => Promise<T>
  ): Promise<T>;
}
```

Executes `executeDbOperations` function optionally inside transaction as specified in `shouldUseTransaction`.

Returns the return value of `executeDbOperations` or on error throws an exception.
