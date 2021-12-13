## Dependency Injection (DI)

Here is example how to use dependency injection (DI) with Backk using [noicejs](https://github.com/ssube/noicejs)
In this example we provide two alternative implementations (AWS and Azure) for a notification service.

### Implement services

Create below 3 files in `src/services/notification`

NotificationService.ts
```ts
export interface NotificationService extends Service {
  sendSmsMessage(smsMessage: SMSMessage): PromiseErrorOr<null>;
  sendEmailMessage(emailMessage: EmailMessage): PromiseErrorOr<null>;
}
```

AwsNotificationServiceImpl.ts
```ts
import { Inject } from 'noicejs';

@Inject('dataStore')
export default class AwsNotificationServiceImpl extends BaseService implements NotificationService {
  constructor(options: any) {
    super({}, options.dataStore)
  }
  
  sendSmsMessage(smsMessage: SMSMessage): PromiseErrorOr<null> {
    // Provide AWS implementation here...
  }
  
  sendEmailMessage(emailMessage: EmailMessage): PromiseErrorOr<null> {
    // Provide AWS implementation here...
  }
}
```

AzureNotificationServiceImpl.ts
```ts
import { Inject } from 'noicejs';

@Inject('dataStore')
export default class AzureNotificationServiceImpl extends BaseService implements NotificationService {
  constructor(options: any) {
    super({}, options.dataStore)
  }
  
  sendSmsMessage(smsMessage: SMSMessage): PromiseErrorOr<null> {
    // Provide Azure implementation here...
  }
  
  sendEmailMessage(emailMessage: EmailMessage): PromiseErrorOr<null> {
    // Provide Azure implementation here...
  }
}
```

### Create DI Modules

Create DI modules in `src/modules` directory:

DataStoreModule.ts

```ts
import { Module, ModuleOptions } from 'noicejs';
import { MySqlDataStore } from "backk";

export default class DataStoreModule extends Module {
  public async configure(options: ModuleOptions) {
    await super.configure(options);

    this.bind('dataStore').toConstructor(MySqlDataStore);
  }
}
```

AwsModule.ts
```ts
import { Module, ModuleOptions } from 'noicejs';
import AwsNotificationServiceImpl from '../services/notification/AwsNotificationServiceImpl';

export default class AwsModule extends Module {
  public async configure(options: ModuleOptions) {
    await super.configure(options);

    this.bind('notificationService').toConstructor(AwsNotificationServiceImpl);
  }
}
```

AzureModule.ts
```ts
import { Module, ModuleOptions } from 'noicejs';
import AzureNotificationServiceImpl from '../services/notification/AzureNotificationServiceImpl'

export default class AzureModule extends Module {
  public async configure(options: ModuleOptions) {
    await super.configure(options);

    this.bind('notificationService').toConstructor(AzureNotificationServiceImpl);
  }
}
```

diModules.ts
```ts
import { Container } from 'noicejs';
import AwsModule from './modules/AwsModule';
import AzureModule from './modules/AzureModule';
import DataStoreModule from '.modules/DataStoreModule'

const diModules = {
  AWS: [new AwsModule(), new DataStoreModule()],
  Azure: [new AzureModule(), new DataStoreModule()]
}

export default diModules;
```

### Implement Microservice Class

Create in `src` directory:

MicroserviceImpl.ts
```ts
import { Inject } from 'noicejs';
import { Microservice } from 'backk';

@Inject('dataStore', 'notificationService')
export default class MicroserviceImpl extends Microservice {
  private readonly notificationService;

  constructor(options: any) {
    super(options.dataStore);
    this.notificationService = options.notificationService;
  }
}
```

### Implement Main

Create in `src` directory:

main.ts
```ts
// organize-imports-ignore
import 'reflect-metadata';
import { Container } from 'noicejs';
import { HttpServer, initializeDefaultJaegerTracing, throwException } from 'backk';
import diModules from './modules/diModules';
import MicroserviceImpl from './MicroserviceImpl';

initializeDefaultJaegerTracing();

async function startMicroservice() {
  const cloudType = process.env.CLOUD_TYPE ?? throwException('Environment variable CLOUD_TYPE is not defined.');
  const diContainer = Container.from(diModules[cloudType] ?? throwException('Unknown CLOUD_TYPE'));
  await diContainer.configure();
  const microservice = await diContainer.create(MicroserviceImpl);
  microservice.start([new HttpServer()]);
}

startMicroservice();
```

