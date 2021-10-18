## Caching

- [Caching Service Function Responses](#cachingservicefunctionresponses)
- [Generic Local In-Memory Caching](#genericlocalinmemorycaching)

### <a name="cachingservicefunctionresponses"></a> Caching Service Function Responses

In order to cache service function response, you need to provide an implementation for
`ResponseCacheConfigService` class in your microservice.

You need to implement following functions:

```ts
shouldCacheServiceFunctionCallResponse(serviceFunctionName: string, serviceFunctionArgument: object): boolean;
getCachingDurationInSecs(serviceFunctionName: string, serviceFunctionArgument: object): number;
```

After these functions are implemented, Backk will automatically cache service function call response based
on the result of call to `shouldCacheServiceFunctionCallResponse`. If the call returns `true`, Backk will
check if cache already contains a response for same service function name and same serviceFunctionArgument.
If the response is found from the cache, it is returned from the cache instead of executing the actual
service function. 


### <a name="genericlocalinmemorycaching"></a> Generic Local In-Memory Caching

You can use local in-memory caching by importing `MemoryCache` from `memory-cache-node` and
creating a new memory cache:

```ts
import { MemoryCache } from 'memory-cache-node';

const myCache = new MemoryCache(5 * 60, Values._100K);
```

For more documentation please refer to [memory-cache-node](https://github.com/pksilen/memory-cache-node)


