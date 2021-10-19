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
  ]
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
