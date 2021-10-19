## Microservice Metadata

- [Backk Metadata](#backkmetadata)
- [Backk Metadata in OpenAPI 3 Format](#openapi)

### <a name="backkmetadata"></a> Backk Metadata
Backk provides its metadata from HTTP endpoint. This metadata can be used to build a dynamic client.

Backk microservice provides its metadata from the following HTTP endpoint:
```
POST /metadataService.getServicesMetadata
```

Backk microservice metadata is provided in following format:

```json
{
  "services": [
    {
      "serviceName": "tagService",
      "functions": [
        {
          "functionName": "deleteAllTags",
          "returnValueType": "PromiseErrorOr<null>",
          "errors": []
        },
        {
          "functionName": "createTag",
          "argType": "Tag",
          "returnValueType": "PromiseErrorOr<One<Tag>>",
          "errors": []
        },
        {
          "functionName": "getTagsByName",
          "argType": "TagName",
          "returnValueType": "PromiseErrorOr<Many<Tag>>",
          "errors": []
        }
      ],
      "types": {
        "Tag": {
          "_id": "string",
          "name": "string"
        },
        "TagName": {
          "name": "string"
        },
        "BackkError": {
          "statusCode": "integer",
          "errorCode": "?string",
          "message": "string",
          "stackTrace": "?string"
        }
      },
      "propertyAccess": {
        "Tag": {
          "_id": "readUpdate",
          "name": "readWrite"
        }
      },
      "typesDocumentation": {},
      "typeReferences": {},
      "validations": {
        "Tag": {
          "name": [
            "isAnyString()",
            "maxLength(64)"
          ],
          "_id": [
            "maxLengthAndMatches(24, /^[a-f\\d]{1,24}$/)",
            "isStringOrObjectId()"
          ]
        },
        "TagName": {
          "name": [
            "isAnyString()",
            "maxLength(64)"
          ]
        }
      }
    }
  ],
  "commonErrors": {
    "ENTITY_VERSION_MISMATCH": {
      "errorCode": "1",
      "message": "Entity version conflict. Entity was updated before this request, please re-fetch the entity and try update again",
      "statusCode": 409
    },
    "ENTITY_LAST_MODIFIED_TIMESTAMP_MISMATCH": {
      "errorCode": "2",
      "message": "Entity last modified timestamp conflict. Entity was updated before this request, please re-fetch the entity and try update again",
      "statusCode": 409
    },
    "DUPLICATE_ENTITY": {
      "errorCode": "3",
      "message": "Duplicate entity",
      "statusCode": 409
    },
    "ENTITY_NOT_FOUND": {
      "errorCode": "4",
      "message": "Entity not found",
      "statusCode": 404
    },
    "INVALID_ARGUMENT": {
      "errorCode": "5",
      "message": "Invalid argument: ",
      "statusCode": 400
    },
    "SERVICE_FUNCTION_CALL_NOT_AUTHORIZED": {
      "errorCode": "6",
      "message": "Service function call not authorized",
      "statusCode": 403
    },
    "MAX_ENTITY_COUNT_REACHED": {
      "errorCode": "7",
      "message": "Maximum sub-entity count reached. Cannot add new sub-entity",
      "statusCode": 422
    },
    "UNKNOWN_SERVICE": {
      "errorCode": "8",
      "message": "Unknown service: ",
      "statusCode": 501
    },
    "UNKNOWN_SERVICE_FUNCTION": {
      "errorCode": "9",
      "message": "Unknown function: ",
      "statusCode": 501
    },
    "MISSING_SERVICE_FUNCTION_ARGUMENT": {
      "errorCode": "10",
      "message": "Missing service function argument",
      "statusCode": 406
    },
    "REMOTE_SERVICE_FUNCTION_CALL_NOT_ALLOWED": {
      "errorCode": "11",
      "message": "Remote service function call not allowed",
      "statusCode": 403
    },
    "TOO_MANY_SERVICE_FUNCTIONS_CALLED": {
      "errorCode": "12",
      "message": "Too many service functions called",
      "statusCode": 429
    },
    "REMOTE_SERVICE_FUNCTION_CALL_NOT_ALLOWED_INSIDE_TRANSACTION": {
      "errorCode": "13",
      "message": "Remote service function call not allowed inside transaction",
      "statusCode": 400
    },
    "ALLOWED_REMOTE_SERVICE_FUNCTIONS_REGEXP_PATTERN_NOT_DEFINED": {
      "errorCode": "14",
      "message": "Allowed remote service functions regular expression pattern not defined",
      "statusCode": 400
    },
    "HTTP_METHOD_MUST_BE_POST": {
      "errorCode": "15",
      "message": "Invalid HTTP method. HTTP method must be POST",
      "statusCode": 405
    },
    "REQUEST_IS_TOO_LONG": {
      "errorCode": "16",
      "message": "Request is too long",
      "statusCode": 413
    },
    "USER_NOT_AUTHENTICATED": {
      "errorCode": "17",
      "message": "User is not authenticated",
      "statusCode": 401
    }
  }
}
```

### <a name="openapi"></a> Backk Metadata in OpenAPI 3 Format
Backk provides its metadata in OpenAPI 3 format from HTTP endpoint. This metadata can be used to build a dynamic client.

Backk microservice provides its metadata in OpenAPI 3 format from the following HTTP endpoint:
```
POST /metadataService.getOpenApiSpec
```

OpenAPI 3 spec can also be generated for the microservice with following command:
```bash
npm run generateApiSpecs
```

The above command generates two spec files, one for public services and one for Kubernetes cluster internal services.
