## Executing Multiple Service Functions within One Request

It is possible to execute multiple service function calls from one HTTP request. By default, this feature is not enabled, 
but when instantiating an `HttpServer`, `options` can be provided to allow multiple service function execution:

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

`multipleServiceFunctionExecution.maxServiceFunctionCount` specifies how many service functions can be called in one request.
`multipleServiceFunctionExecution.regExpForAllowedRemoteServiceFunctionCalls` is a regular expression that specifies which remote service functions can be called when executing multiple service function calls. If you want that your microservice enables execution of remote service functions you need to supply this parameter.
For example: `/.+/`

When you want to execute multiple service functions, you should send the HTTP request to one of the following endpoints:
- `executeMultipleServiceFunctionsInParallelInsideTransaction`
- `executeMultipleServiceFunctionsInParallelWithoutTransaction`
- `executeMultipleServiceFunctionsInSequenceInsideTransaction`
- `executeMultipleServiceFunctionsInSequenceWithoutTransaction`

If you are executing service functions that modify data in the database, you should use the transactional endpoints, but
if you are just querying database data, you might want to use the non-transactional endpoints.

For the HTTP request body, you should specify the to be executed service functions and their arguments as JSON object:

```
POST /executeMultipleServiceFunctionsInParallelWithoutTransaction
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
    "serviceFunctionName": "tagService.getSalesItems",
    "serviceFunctionArgument": {
      "nameFilter": ""
    }
  }
}
```

You can also execute remote microservice requests.
If the service function exists in a remote Backk microservice, you need to specify the remote Backk
microservice name (and namespace, if it is not same). For example:

```
POST /executeMultipleServiceFunctionsInParallelWithoutTransaction
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
    "serviceFunctionName": "tagService.getSalesItems",
    "serviceFunctionArgument": {
      "nameFilter": ""
    }
  }
}
```
