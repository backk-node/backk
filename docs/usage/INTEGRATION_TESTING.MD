## Integration Testing

- [Automatic Integration Tests](#automaticintegrationtests)
- [Manual Integration Tests](#manualintegrationtests)

### <a name="automaticintegrationtests"></a> Automatic Integration Tests
By default, Backk Microservice will automatically generate integration tests for your `CrudEntityService` based 
services. The integration tests are generated as a Postman collection, which you import to Postman application or
run using [Newman](https://www.npmjs.com/package/newman). Integration tests can be executed using Newman from the command line with following command:

```bash
npm run integrationtest:dev
```

**IMPORTANT**!
The automatic integration tests are created for services in the same order as services are declared in the `MicroserviceImpl`
class. The automatic integration tests per service are also created in the same order as the service functions are
declared in the service class. As a good rule of thumb, declare first a `deleteAll<Entities>` operation to clean up the data store.
Then you should typically declare rest of the service functions in CRUD-order. I.e. first create entity method, then read/get entity/entities methods,
then update entity method(s) and finally delete method.

### <a name="manualintegrationtests"></a> Manual Integration Tests
Automatic integration tests are typically not enough. They don't handle special cases or error situations.
For these, you need to create the integration tests manually. Manual integration tests are created in directory
`integrationtests`. You should create a subdirectory for each service you have in the Backk microservice.
Place each service's integration tests to the respective service folder inside `integrationtests` folder.
Manual integration tests can be written in YAML or JSON.

Here is an example of a manual integration test which defines pre- and post-conditions for an automatic
integration test of `userAccountService.addFavoriteSalesItem`:

testAddToFavoriteSalesItem.yaml
```yaml
- given: sales item exists
  serviceFunctionName: salesItemService.createSalesItem
  responseTests:
    - pm.collectionVariables.set('salesItemId', body.data._id);

- then: user account has a favorite sales item
  serviceFunctionName: userAccountService.getUserAccount
  responseTests:
    - pm.expect(body.data.favoriteSalesItems[0]._id).to.eql(pm.collectionVariables.get('salesItemId'))
```

The `given` pre-condition ensures that a sales item exists by creating it. Then after executing the 
automatic integration test for `userAccountService.addFavoriteSalesItem`, we want to verify that
user account has a new favorite sales item present.

For more manual integration test examples, please check [backk-example-microservice manual integration tests](https://github.com/backk-node/backk-example-microservice/tree/main/integrationtests)
