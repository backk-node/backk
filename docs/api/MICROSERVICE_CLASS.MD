## Microservice Class

- [constructor](#constructor)
- [start](#start)

### <a name="constructor"></a> constructor

Create a new `MicroserviceImpl` class by extending the class `Microservice`.
Add your one or more service(s) that comprise the microservice as fields of the `MicroserviceImpl` class.
Instantiate your data store and supply it as parameter to your service(s) and super class constructor:

```typescript
import { MySqlDataStore } from 'backk';

const dataStore = new MySqlDataStore();

class MicroserviceImpl extends Microservice {
  private readonly userAccountService = new UserAccountServiceImpl(dataStore);

  constructor() {
    super(dataStore);
  }
}
```

In the example above, if the `userAccountService` has function `createUser`, it can be accessed over HTTP from external public clients like this:

```
POST /userAccountService.createUser
```

The argument for the service function call `userAccountService.createUser` is sent in the HTTP POST request body encoded in JSON

### <a name="start"></a> start

```ts
export default class Microservice {
  async start(
    requestProcessors: NonEmptyArray<RequestProcessor>,
    shouldGeneratePostmanIntegrationTestsOnRestartInDevEnv = true
  )
}
```

starts the microservice with the given request processor(s). You must define at least one
[Request Processor](MICROSERVICE_INITIALIZATION.MD).
