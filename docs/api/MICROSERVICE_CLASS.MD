## Microservice Class

- [start](#start)

Create a new `MicroserviceImpl` class by extending the class `Microservice`.
Add your one or more service(s) that comprise the microservice as private readonly fields of the `MicroserviceImpl` class.

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

In the example above, there is one service `userAccountService` in the microservice which can be accessed over HTTP like this:

```
POST https://<user-account-microservice-host>:<port>/userAccountService
```

If the `userAccountService` has function `createUser`, it can be accessed over HTTP like this:

```
POST https://<user-account-microservice-host>:<port>/userAccountService.createUser
```

The argument for the service function call `userAccountService.createUser` is sent in the HTTP POST request message body encoded in JSON

### <a name="start"></a> start

```ts
export default class Microservice {
  async start(
    commandLineArgs: string[],
    requestProcessors: NonEmptyArray<RequestProcessor>,
    shouldGeneratePostmanIntegrationTestsOnRestartInDevEnv = true
  )
}
```

start the microservice with given command line arguments and request processors. You must define at least one
request processor.
