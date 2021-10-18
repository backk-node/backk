## Executing Multiple Service Functions within One Request
It is possible to execute multiple service function calls from one HTTP request.

When starting the HTTP server, `options` can be provided to allow multiple service function execution:

```ts
function startHttpServerFor(
  microservice: Microservice,
  options?: ServiceFunctionExecutionOptions,
  httpVersion: HttpVersion = 1
);

interface ServiceFunctionExecutionOptions {
  isMetadataServiceEnabled?: boolean;
  httpGetRequests?: {
    regExpForAllowedServiceFunctionNames?: RegExp;
    deniedServiceFunctionNames?: string[];
  };
  multipleServiceFunctionExecution?: {
    isAllowed?: boolean;
    maxServiceFunctionCount?: number;
    shouldAllowTemplates?: boolean;
    regExpForAllowedRemoteServiceFunctionCalls?: RegExp;
  };
}
```

When you want to execute multiple service functions, you should send the HTTP request to one of the following endpoints:
- executeMultipleInParallelInsideTransaction
- executeMultipleInParallelWithoutTransaction
- executeMultipleInSequenceInsideTransaction
- executeMultipleInSequenceWithoutTransaction

For the HTTP request body, you should specify the to be executed service functions and their arguments as JSON object:

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

If the service function exists in a remote Backk microservice, you need to specify the remote Backk
microservice name (and namespace, if it is not same). For example:

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
    "serviceFunctionName": "tagService.getSalesItems",
    "serviceFunctionArgument": {
      "nameFilter": ""
    }
  }
}
```
