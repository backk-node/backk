## <a name="api-documentation-base-services"></a> Base Services

- [BaseService](#baseservice)
- [CrudEntityService](#crudentityservice)
- [UserBaseService](#userbaseservice)
- [AuthorizationService](#authorizationservice)
- [JwtAuthorizationServiceImpl](#jwtauthorizationserviceimpl)
- [ResponseCacheConfigService](#responsecacheconfigservice)
- [CaptchaVerificationService](#captchaverificationservice)
- [LivenessCheckService](#livenesscheckservice)
- [ReadinessCheckService](#readinesscheckservice)
- [StartupCheckService and StartupCheckServiceImpl](#startupcheckservice)
- [AuditLoggingService](#auditloggingservice)

### <a name="baseservice"></a> BaseService

A base class for your own services.

```ts
export default class BaseService implements Service {
  constructor(
    private readonly errorNameToErrorDefinitionMap: ErrorNameToErrorDefinitionMap,
    protected readonly dataStore: DataStore
  ) {}
}

export type ErrorNameToErrorDefinitionMap = { [errorName: string]: ErrorDefinition };

export type ErrorDefinition = {
  readonly errorCode: number | string;
  readonly message: string;
  readonly statusCode?: number;
};
```

Implement your own service class by extending `BaseService` class.

When calling base class constructor, you must provide:
- error definitions for your service (or empty object, if your service does not raise any errors)
- data store used by your service (if you are not using a data store, provide an instance of `NullDataStore`)

Example of error definitions:

```ts
import { HttpStatusCodes } from 'backk';

export const orderServiceErrors = {
  cannotRemoveDeliveredOrderItem: {
    statusCode: HttpStatusCodes.BAD_REQUEST,
    errorCode: 1,
    message: 'Cannot remove delivered order item',
  },
  invalidOrderItemCurrentState: {
    statusCode: HttpStatusCodes.BAD_REQUEST,
    errorCode: 2,
    message: 'Cannot update order item state due to invalid current state',
  }
}
```

When error is reported to a client, Backk will add the service name to the beginning the error code, for example: `orderService.1`.
This ensures that all error codes reported by the services of the microservice have unique error codes towards clients.
Backk will also check your `errorNameToErrorDefinitionMap` for potential duplicates in error codes and error messages.
If duplicates are found, an exception will be thrown. This ensures that you don't accidentally use same error code or message twice.

Then, instantiate your class and store it as a field in your `MicroserviceImpl` class:

```typescript
export default class MicroserviceImpl extends Microservice {
  private readonly myService = new MyServiceImpl();
}
```

### <a name="crudentityservice"></a> CrudEntityService

A base class for your own resource-based services for creating, reading, updating and deleting entities.
NOTE! It is not mandatory to use CrudEntityService as base class for you resource-based services, you can also use just `BaseService` as a base class.

Functions in `CrudEntityService` based services must follow the following rules:

- Create function names must start with _create_ or _insert_ or function must be annotated with `@Create()`
- Read function names must start with _get_, _read_, _find_, _fetch_, _retrieve_ or _obtain_ or function must be annotated with `@Read()`
- Update function names must start with _update_, _modify_, _change_ or _patch_ or function must be annotated with `@Update()`
- Delete function names must start with _delete_, _erase_ or _destroy_ or function must be annotated with `@Delete()`

Using above naming conventions or annotations, Backk is able to generate automatic integration tests.
If the above rules are not followed, an exception will be thrown.

Implement your own service class by extending `CrudEntityService` class.

When calling base class constructor, you must provide:
- error definitions for your service (or empty object, if your service does not raise any errors)
- data store used by your service (if you are not using a data store, provide an instance of `NullDataStore`)

Example of error definitions:

```ts
import { HttpStatusCodes } from 'backk';

export const orderServiceErrors = {
  cannotRemoveDeliveredOrderItem: {
    statusCode: HttpStatusCodes.BAD_REQUEST,
    errorCode: 1,
    message: 'Cannot remove delivered order item',
  },
  invalidOrderItemCurrentState: {
    statusCode: HttpStatusCodes.BAD_REQUEST,
    errorCode: 2,
    message: 'Cannot update order item state due to invalid current state',
  }
}
```

When error is reported to a client, Backk will add the service name to the beginning the error code, for example: `orderService.1`.
This ensures that all error codes reported by the services of the microservice have unique error codes towards clients.
Backk will also check your `errorNameToErrorDefinitionMap` for potential duplicates in error codes and error messages.
If duplicates are found, an exception will be thrown. This ensures that you don't accidentally use same error code or message twice.

Then, instantiate your class and store it as a field in your `MicroserviceImpl` class:

```typescript
export default class MicroserviceImpl extends Microservice {
  private readonly myService = new MyServiceImpl();
}
```

### <a name="userbaseservice"></a> UserBaseService

Each microservice which has one or more service functions that have annotation `@AllowForEveryUserForOwnResources()`
must implement a service extending `UserBaseService`. Otherwise, an exception is thrown upon authorization.

Implement your own service class `UserServiceImpl` by extending `UserBaseService` class and
implement the following function:
- `getIdBySubject(subject: Subject): PromiseErrorOr<One<_Id>>`

This function should return user's `_id` given `subject` as argument. Subject is the unique id of the user from the IAM system.

Then, instantiate your class and store it as a field in your `MicroserviceImpl` class:

```typescript
export default class MicroserviceImpl extends Microservice {
  private readonly userService = new UserServiceImpl();
}
```

### <a name="authorizationservice"></a>AuthorizationService

Authorizes client requests based on Authorization header. This is a generic service, and if you are using OAuth 2.0 and JWT, you
should use `JwtAuthorizationServiceImpl` class for your authorization service (see next section).

```typescript
export interface AuthorizationService {
  hasUserRoleIn(roles: string[], authHeader: string | string[] | undefined): Promise<boolean>;
  getSubject(authHeader: string | string[] | undefined): Promise<string | undefined>;
}
```

`authHeader` argument contains the Authorization header content, e.g. `Bearer vF9dft4qmT...`.

Create an `AuthorizationServiceImpl` class that implements the `AuthorizationService` interface and provide implementations for the functions:
- `hasUserRoleIn` should return true if user has at least one role in `roles`
- `getSubject` should return the unique id of the user in the IAM system. For example, this info is available in OAuth 2.0 Access Token's `sub` claim.

Then, instantiate your class and store it as a field in your `MicroserviceImpl` class:

```typescript
export default class MicroserviceImpl extends Microservice {
  private readonly authorizationService = new AuthorizationServiceImpl();
}
```

### <a name="jwtauthorizationserviceimpl"></a> JwtAuthorizationServiceImpl

JWT authorization service which checks if user is authorized based JWT bearer token supplied in Authorization header.
This service requires following environment variables to be defined:

- `AUTH_SERVER_PUBLIC_KEY_URL` defines the Authorization Server URL where to fetch the JWT signing public key. (Needed only in production environment), for example `https://keycloak.platform.svc.cluster.local:<port>/auth/realms/<my-realm>` or `https://keycloak.platform.svc.cluster.local:<port>/auth/realms/<my-realm>/protocol/openid-connect/certs`
- `PUBLIC_KEY_PATH` path where public key is available in public key fetch response, for example: `public_key` or `keys[0].n`
- `JWT_ROLES_CLAIM_PATH` JWT path where for user's roles, for example `realm_access.roles`

Additionally, you can define following environment variables for HTTPS:
- `AUTH_SERVER_TLS_CA_FILE_PATH_NAME` defines the full path name of the file containing PEM encoded CA certificates to trust
- `AUTH_SERVER_TLS_CERT_FILE_PATH_NAME` defines the full path name of the file containing PEM encoded certificate (for mTLS)
- `AUTH_SERVER_TLS_KEY_FILE_PATH_NAME` defines the full path name of the file containing PEM encoded private key  (for mTLS)

*NOTE!*
In non-production environments, Authorization server as defined by `AUTH_SERVER_PUBLIC_KEY_URL` environment variable, is not contacted, but signing secret defined in `JWT_SIGN_SECRET` in used to sign/verify JWT.

To use JWT authorization service, instantiate JwtAuthorizationServiceImpl class and store it as a field in your `MicroserviceImpl` class:

```typescript
export default class MicroserviceImpl extends Microservice {
  private readonly authorizationService = new JwtAuthorizationServiceImpl();
}
```

### <a name="responsecacheconfigservice"></a> ResponseCacheConfigService

Caches service function call responses in Redis for a defined period of time. Caching can be customized by service function name and its argument.
Caching is performed only for HTTP requests with GET method.

For security reasons, each microservice should have its own Redis cache instance with following requirements:
- Redis authentication with password is required
- Redis persistence is not used
- Connection between microservice and Redis is secured (mTLS by a service mesh)

```typescript
export interface ResponseCacheConfigService {
  shouldCacheServiceFunctionCallResponse(serviceFunctionName: string, serviceFunctionArgument: object): boolean;
  getCachingDurationInSecs(serviceFunctionName: string, serviceFunctionArgument: object): number;
}
```

This service requires following environment variables to be defined:
- `REDIS_CACHE_HOST` which denotes the Redis cache server host
- `REDIS_CACHE_PORT` which denotes the Redis cache server port
- `REDIS_CACHE_PASSWORD` which denotes the Redis server password

Create a `ResponseCacheConfigServiceImpl` class that implements the `ResponseCacheConfigService` interface and provide implementations for the needed functions:
- shouldCacheServiceFunctionCallResponse
- getCachingDurationInSecs

Then, instantiate your class and store it as a field in your `MicroserviceImpl` class:

```typescript
export default class MicroserviceImpl extends Microservice {
  private readonly responseCacheConfigService = new ResponseCacheConfigServiceImpl();
}
```

### <a name="captchaverificationservice"></a> CaptchaVerificationService

Verifies captcha sent in service function call argument in `captchaToken` property:

```json
{
  "captchaToken": "<captcha-token>"
}
```

```typescript
export interface CaptchaVerificationService {
  verifyCaptcha(captchaToken: string): Promise<boolean>;
}
```

Create a `CaptchaVerificationServiceImpl` class that implements the `CaptchaVerificationService` interface and provide implementations for function:
- verifyCaptcha

Then, instantiate your class and store it as a field in your `MicroserviceImpl` class:

```typescript
export default class MicroserviceImpl extends Microservice {
  private readonly captchaVerificationService = new CaptchaVerificationServiceImpl();
}
```

### <a name="livenesscheckservice"></a> LivenessCheckService
This service is called by Kubernetes pod's liveness probe to check if microservice is alive.
The default liveness check service provided by Backk will always return 200 OK with no content.
If you need some custom behaviour, follow the below steps to create your on liveness check service implementation.

```typescript
export default abstract class LivenessCheckService extends BaseService {
  abstract isMicroserviceAlive(): PromiseErrorOr<null>;
}
```

Create a class `LivenessCheckServiceImpl` that extends the `LivenessCheckService` class and provide implementation for function:
- isMicroserviceAlive

Simplest implementation for the function is:

```typescript
import { LivenessCheckService, PromiseErrorOr } from 'backk';

export default class LivenessCheckServiceImpl extends LivenessCheckService {
  isMicroserviceAlive(): PromiseErrorOr<null> {
    return Promise.resolve([null, null]);
  }
}
```

Then, instantiate your class and store it as a field in your `MicroserviceImpl` class:

```typescript
export default class MicroserviceImpl extends Microservice {
  private readonly livenessCheckService = new LivenessCheckServiceImpl();
}
```

### <a name="readinesscheckservice"></a> ReadinessCheckService
This service is called by Kubernetes pod's readiness probe to check if microservice is ready for handling requests

```typescript
export default abstract class ReadinessCheckService extends BaseService {
  abstract isMicroserviceReady(): PromiseErrorOr<null>;
}
```

Create a class `ReadinessCheckServiceImpl` that extends the `ReadinessCheckService` class and provide implementation for function:
- isMicroserviceReady

Example implementation:

```typescript
import { BACKK_ERRORS, HttpStatusCodes, ReadinessCheckService } from 'backk';

export default class ReadinessCheckServiceImpl extends ReadinessCheckService {
  constructor() {
    super({});
  }
  
  async isMicroserviceReady(): PromiseErrorOr<null> {
    // isReady is some function implemented by you to perform checks for microservice readiness
    return await isReady() ? [null, null] : [null, BACKK_ERRORS.MICROSERVICE_NOT_READY];
  }
}
```

Then, instantiate your class and store it as a field in your `MicroserviceImpl` class:

```typescript
export default class MicroserviceImpl extends Microservice {
  private readonly readinessCheckService = new ReadinessCheckServiceImpl();
}
```

### <a name="startupcheckservice"></a> StartupCheckService and DefaultStartupCheckServiceImpl
This service is called by Kubernetes pod's startup probe to check if microservice is started successfully.

```typescript
export default abstract class StartupCheckService extends BaseService {
  abstract isMicroserviceStarted(): PromiseErrorOr<null>;
}
```

`DefaultStartupCheckServiceImpl` is the Backk default implementation for the startup check service. It checks if database is successfully initialized and jobs are scheduled.
If you need to perform additional checks, create a new class that extends the `DefaultStartupCheckServiceImpl` class and provide implementation for the `isMicroserviceStarted` function.
NOTE! Your implementation should first call the base class method and then execute additional checks. For example:

```typescript
import { BACKK_ERRORS, DataStore, DefaultStartupCheckServiceImpl, HttpStatusCodes } from 'backk';

export default class StartupCheckServiceImpl extends DefaultStartupCheckServiceImpl {
  constructor(dataStore: DataStore) {
    super({}, dataStore);
  }
  
  async isMicroserviceStarted(): PromiseErrorOr<null> {
    const [, error] = await super.isMicroserviceStarted();
    if (error) {
      return [null, error];
    }

    // isStarted is some function implemented by you to perform additional startup checks
    return await isStarted() ? [ null, null] : [null, BACKK_ERRORS.MICROSERVICE_NOT_STARTED]
  }
}
```

You can also implement the same as above you class composition instead of inheritance: 
```typescript
import { BACKK_ERRORS, DefaultStartupCheckServiceImpl, HttpStatusCodes, StartupCheckService } from 'backk';

export default class StartupCheckServiceImpl extends StartupCheckService {
  private readonly defaultStartupCheckService: StartupCheckService;

  constructor(dataStore: DataStore) {
    super({}, dataStore);
    this.defaultStartupCheckService = new DefaultStartupCheckServiceImpl(dataStore);
  }
  
  async isMicroserviceStarted(): PromiseErrorOr<null> {
    const [, error] = await this.defaultStartupCheckService.isMicroserviceStarted();
    if (error) {
      return [null, error];
    }

    // isStarted is some function implemented by you to perform additional startup checks
    return await isStarted() ? [ null, null] : [null, BACKK_ERRORS.MICROSERVICE_NOT_STARTED]
  }
}
```

Instantiate the `DefaultStartupCheckServiceImpl` class or your own implementation class and store it as a field in your `MicroserviceImpl` class:

```typescript
export default class MicroserviceImpl extends Microservice {
  private readonly startupCheckService = new StartupCheckServiceImpl();
}
```

### <a name="auditloggingservice"></a> AuditLoggingService
This service is called to log requests made to the microservice.

```typescript
export interface AuditLoggingService {
  log(auditLogEntry: AuditLogEntry): Promise<void>;
}

export interface AuditLogEntry {
  Timestamp: string;
  TraceId?: string;
  SpanId?: string;
  TraceFlags?: number;
  subject: string;
  clientIp: string;
  authorizationHeader: string;
  userOperation: string;
  userOperationResult: UserOperationResult;
  userOperationHttpStatusCode: number;
  userOperationErrorMessage: string;
  Resource: Resource;
  Attributes?: { [key: string]: string | number | boolean | undefined };
}

export type UserOperationResult = 'success' | 'failure';
```

Create a class `AuditLoggingServiceImpl` that implements the `AuditLoggingService` interface and provides implementation for the `log` function.
You `log` function implementation should store the `auditLogEntry` information to a safe remote location. In the implementation, you can use for example `makeHttpRequest`.

Instantiate your class and store it as a field in your `MicroserviceImpl` class:

```typescript
export default class MicroserviceImpl extends Microservice {
  private readonly auditLoggingService = new AuditLoggingServiceImpl();
}
```
