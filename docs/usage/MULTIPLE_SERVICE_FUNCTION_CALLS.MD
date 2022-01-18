## Executing Multiple Service Functions within One Request

It is possible to execute multiple service function calls from one HTTP request. By default, this feature is not enabled, 
but when instantiating an `HttpServer`, constructor parameter `options` can be provided to allow multiple service function execution:

```ts
class HttpServer implements RequestProcessor {
  constructor(
    private readonly httpVersion: HttpVersion = 1,
    private readonly options?: ServiceFunctionExecutionOptions
  )
}

interface ServiceFunctionExecutionOptions {
  multipleServiceFunctionExecution?: {
    maxServiceFunctionCount?: number;
    regExpForAllowedRemoteServiceFunctionCalls?: RegExp;
  };
}
```

You typically instantiate the `HttpServer` in `main.ts` when you start the microservice.

`multipleServiceFunctionExecution.maxServiceFunctionCount` specifies how many service functions at maximum can be called in one request.
`multipleServiceFunctionExecution.regExpForAllowedRemoteServiceFunctionCalls` is a regular expression that specifies which remote service functions can be called when executing multiple service function calls. If you want that your microservice enables execution of remote service functions you need to supply this parameter. If this parameter is not provided, no remote service function calls are allowed.
For example: `/.+/` will allow execution of any remote service function calls.

When you want to execute multiple service functions, you should send the HTTP request to one of the following endpoints:
- `multipleServiceFunctionExecutionService.executeInParallelInsideTransaction`
- `multipleServiceFunctionExecutionService.executeInParallelWithoutTransaction`
- `multipleServiceFunctionExecutionService.executeInSequenceInsideTransaction`
- `multipleServiceFunctionExecutionService.executeInSequenceWithoutTransaction`

If you are executing service functions that modify data in the database, you should use the transactional endpoints, but
if you are just querying database data, you might want to use the non-transactional endpoints.

For the HTTP request body, you should specify the to be executed service functions and their arguments as JSON object:

```
POST /multipleServiceFunctionExecutionService.executeInParallelWithoutTransaction
```

```json
{
  "shirtSalesItems": {
    "serviceFunctionName": "salesItemService.getSalesItems",
    "serviceFunctionArgument": {
      "textFilter": "shirt"
    }
  },
  "allTags": {
    "serviceFunctionName": "tagService.getTagsByName",
    "serviceFunctionArgument": {
      "nameFilter": ""
    }
  }
}
```

The response will be:

```json
{
  "shirtSalesItems": {
    "metadata": {},
    "data": [/* sales items*/]
  },
  "allTags": {
    "metadata": {},
    "data": [/* tags */]
  }
}
```

You can also execute remote microservice requests.
If the service function exists in a remote Backk microservice, you need to specify the remote Backk
microservice name (and namespace, if it is not same). For example:

```
POST /multipleServiceFunctionExecutionService.executeInParallelWithoutTransaction
```

```json
{
  "shirtSalesItems": {
    "microserviceName": "sales-item-service",
    "serviceFunctionName": "salesItemService.getSalesItems",
    "serviceFunctionArgument": {
      "textFilter": "shirt"
    }
  },
  "allTags": {
    "microserviceName": "tag-service",
    "microserviceNamespace": "default",
    "serviceFunctionName": "tagService.getTagsByName",
    "serviceFunctionArgument": {
      "nameFilter": ""
    }
  }
}
```

NOTE! If you are using calls to remote service functions, you cannot use these transactional endpoints:
- `multipleServiceFunctionExecutionService.executeInParallelInsideTransaction`
- `multipleServiceFunctionExecutionService.executeInSequenceInsideTransaction`
