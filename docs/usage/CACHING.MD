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


### <a name="genericlocalinmemorycaching"></a> Generic Local In-Memory Caching

You can use local in-memory caching by importing and creating a local in-memory cache:

```ts
import { MemoryCache } from 'memory-cache-node';

const subjectCache = new MemoryCache(5 * 60, Values._100K);
```

For more documentation please refer to [memory-cache-node](https://github.com/pksilen/memory-cache-node)


