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

You need to name the file of the integration test according to service function you want to test. If you want to
write integration test for `addToFavoriteSalesItems` function, you should name the integration test file with `test` prefix and function name, e.g. `testAddToFavoriteSalesItems`

Here is an example of a manual integration test which defines pre- and post-conditions for an automatic
integration test of `userAccountService.addFavoriteSalesItems`:

testAddToFavoriteSalesItems.yaml
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
user account has a new favorite sales item present (`then` post-condition). 

Your integration test can contain zero or more `given` steps and zero or more `then` steps.

#### <a name="manualintegrationtests"></a> Test Templates

Your manual integration test file can also contain tests from one or more test templates.
Tests are executed in the order as defined in the integration test file.
Templates can contain variables with `{{variableName}}` notation. In your tests, you assign values to these variables in `testProperties` section.

Here is an example:

```yaml
- testTemplate:
    serviceFunctionName: salesItemService.createSalesItem
    argument:
      title: '{{title}}'
      description: '{{description}}'
      area: '{{area}}'
      productDepartment: '{{category}}'
      productCategory: '{{category}}'
      productSubCategory: '{{category}}'
      price: '{{price}}'
    responseTests:
      - pm.collectionVariables.set('salesItemId', body.data._id)
  tests:
    - testName: GIVEN create sales item with price = 1
      testProperties:
        price: 1
        title: firstTitle
        description: firstDescription
        area: Area1
        category: Vehicles
    - testName: GIVEN create sales item with price = 2
      testProperties:
        price: 2
        title: secondTitle
        description: secondDescription
        area: Area2
        category: Clothes
```

In the above example, we have a test template for creating a sales item. Then in the `tests` array, we can define
or more tests using the test template. In the above example, we create two different sales items.

Below is an example, where we use the above created sales items to test getting of sales items using different filters, sorting and pagination:

```yaml
- testTemplate:
    serviceFunctionName: salesItemService.getSalesItems
    argument:
      '{{argumentPropertyName1}}': '{{argumentPropertyValue1}}'
      '{{argumentPropertyName2}}': '{{argumentPropertyValue2}}'
    responseTests:
      - pm.expect(body.data[0].{{responsePropertyName}}).to.eql({{responsePropertyValue}})
      - pm.expect(body.data.length).to.eql({{responseLength}})
  tests:
    - testName: get sales items for textFilter = 'secondTitle'
      testProperties:
        argumentPropertyName1: textFilter
        argumentPropertyValue1: secondTitle
        responsePropertyName: title
        responsePropertyValue: '"secondTitle"'
        responseLength: 1

    - testName: get sales items for textFilter = 'secondDescription'
      testProperties:
        argumentPropertyName1: textFilter
        argumentPropertyValue1: secondDescription
        responsePropertyName: title
        responsePropertyValue: '"secondTitle"'
        responseLength: 1

    - testName: get sales items where areas contains Area2
      testProperties:
        argumentPropertyName1: areas
        argumentPropertyValue1:
          - Area2
        responsePropertyName: title
        responsePropertyValue: '"secondTitle"'
        responseLength: 1

    - testName: get sales items where productDepartments contains 'Clothes'
      testProperties:
        argumentPropertyName1: productDepartments
        argumentPropertyValue1:
          - Clothes
        responsePropertyName: title
        responsePropertyValue: '"secondTitle"'
        responseLength: 1

    - testName: get sales items where productCategories contains 'Clothes'
      testProperties:
        argumentPropertyName1: productCategories
        argumentPropertyValue1:
          - Clothes
        responsePropertyName: title
        responsePropertyValue: '"secondTitle"'
        responseLength: 1

    - testName: get sales items where productSubCategories contains 'Clothes'
      testProperties:
        argumentPropertyName1: productSubCategories
        argumentPropertyValue1:
          - Clothes
        responsePropertyName: title
        responsePropertyValue: '"secondTitle"'
        responseLength: 1

    - testName: get sales items where price is between minPrice and maxPrice
      testProperties:
        argumentPropertyName1: minPrice
        argumentPropertyValue1: 2
        argumentPropertyName2: maxPrice
        argumentPropertyValue2: 2
        responsePropertyName: price
        responsePropertyValue: 2
        responseLength: 1

    - testName: get sales items sorted
      testProperties:
        argumentPropertyName1: sortBys
        argumentPropertyValue1:
          - fieldName: price
            sortDirection: DESC
        responsePropertyName: price
        responsePropertyValue: 2
        responseLength: 2

    - testName: get sales items paginated
      testProperties:
        argumentPropertyName1: paginations
        argumentPropertyValue1:
          - pageNumber: 2
            pageSize: 1
        argumentPropertyName2: sortBys
        argumentPropertyValue2:
          - fieldName: price
            sortDirection: DESC
        responsePropertyName: price
        responsePropertyValue: 1
        responseLength: 1
```

Finally, we have the last test:

```yaml
- testTemplate:
    serviceFunctionName: salesItemService.deleteAllSalesItems
```

If the `tests` section is missing, like above, then the template is executed exactly once.

For more manual integration test examples, please check [backk-example-microservice manual integration tests](https://github.com/backk-node/backk-example-microservice/tree/main/integrationtests)
