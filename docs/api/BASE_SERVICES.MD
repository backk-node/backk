## <a name="api-documentation-base-services"></a> Base Services

- [BaseService](#baseservice)
- [CrudEntityService](#crudentityservice)
- [UserAccountBaseService](#useraccountbaseservice)
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
    protected readonly dataStore: AbstractDataStore
  ) {}
}

export type ErrorDefinition = {
  readonly errorCode: string;
  readonly message: string;
  readonly statusCode?: number;
};

export type ErrorNameToErrorDefinitionMap = { [errorName: string]: ErrorDefinition };
```

Implement your own service class by extending `BaseService` class.
When calling base class constructor, you must provide:

- error definitions for your service (or empty object, if your service does not raise any errors)
- data store used by your service (if you are not using a data store, provide an instance of `NullDataStore`)

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

Then, instantiate your class and store it as a field in your `MicroserviceImpl` class:

```typescript
export default class MicroserviceImpl extends Microservice {
  private readonly myService = new MyServiceImpl();
}
```

### <a name="useraccountbaseservice"></a> UserAccountBaseService

Each microservice which has one or more service functions that have annotation `@AllowForSelf()`
must implement a service extending `UserAccountBaseService`. Otherwise, an exception is thrown upon authorization.

Implement your own service class by extending `UserAccountBaseService` class and
implement following function:

- getUserNameById

Then, instantiate your class and store it as a field in your `MicroserviceImpl` class:

```typescript
export default class MicroserviceImpl extends Microservice {
  private readonly myService = new MyServiceImpl();
}
```

### <a name="authorizationservice"></a>AuthorizationService

Authorizes client requests based on Authorization header

```typescript
export default abstract class AuthorizationService {
  abstract hasUserRoleIn(roles: string[], authHeader: string | string[] | undefined): Promise<boolean>;
  abstract getSubject(authHeader: string | string[] | undefined): Promise<string | undefined>;
}
```

`authHeader` argument contains the Authorization header content, e.g. `Bearer vF9dft4qmT...`.

Implement a class that extends the `AuthorizationService` class and provide implementations for function:

- hasUserRoleIn
- getSubject

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
export default abstract class ResponseCacheConfigService {
  abstract shouldCacheServiceFunctionCallResponse(
    serviceFunctionName: string,
    serviceFunctionArgument: object
  ): boolean;
  abstract getCachingDurationInSecs(serviceFunctionName: string, serviceFunctionArgument: object): number;
}
```

This service requires following environment variables to be defined:

- `REDIS_CACHE_HOST` which denotes the Redis cache server host
- `REDIS_CACHE_PORT` which denotes the Redis cache server port
- `REDIS_CACHE_PASSWORD` which denotes the Redis server password

Implement a class that extends the `ResponseCacheConfigService` class and provide implementations for functions:

- shouldCacheServiceFunctionCallResponse
- getCachingDurationInSecs

Then, instantiate your class and store it as a field in your `MicroserviceImpl` class:

```typescript
export default class MicroserviceImpl extends Microservice {
  private readonly responseCacheConfigService = new ResponseCacheConfigServiceImpl();
}
```

### <a name="captchaverificationservice"></a> CaptchaVerificationService

Verifies captcha send in service function call argument in `captchaToken` property:

```json
{
  "captchaToken": "<captcha-token>"
}
```

```typescript
export default abstract class CaptchaVerificationService {
  abstract verifyCaptcha(captchaToken: string): Promise<boolean>;
}
```

Implement a class that extends the `CaptchaVerificationService` class and provide implementations for function:

- verifyCaptcha

Then, instantiate your class and store it as a field in your `MicroserviceImpl` class:

```typescript
export default class MicroserviceImpl extends Microservice {
  private readonly captchaVerificationService = new CaptchaVerificationServiceImpl();
}
```

### <a name="livenesscheckservice"></a> LivenessCheckService

This service is called by Kubernetes pod's liveness probe to check if microservice is alive.

```typescript
export default abstract class LivenessCheckService extends BaseService {
  abstract isMicroserviceAlive(): PromiseErrorOr<null>;
}
```

Implement a class that extends the `LivenessCheckService` class and provide implementations for function:

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

Implement a class that extends the `ReadinessCheckService` class and provide implementations for function:

- isMicroserviceReady

Example implementation, where you need to implement the `isReady` function by yourself:

```typescript
import { HttpStatusCodes, createBackkErrorFromErrorMessageAndStatusCode } from 'backk';

export default class ReadinessCheckServiceImpl extends ReadinessCheckService {
  async isMicroserviceReady(): PromiseErrorOr<null> {
    if (await isReady()) {
      return [null, null];
    }

    const error = createBackkErrorFromErrorMessageAndStatusCode(
      'Microservice is not ready',
      HttpStatusCodes.SERVICE_UNAVAILABLE
    );
    return [null, error];
  }
}
```

Then, instantiate your class and store it as a field in your `MicroserviceImpl` class:

```typescript
export default class MicroserviceImpl extends Microservice {
  private readonly readinessCheckService = new ReadinessCheckServiceImpl();
}
```

### <a name="startupcheckservice"></a> StartupCheckService and StartupCheckServiceImpl

This service is called by Kubernetes pod's startup probe to check if microservice is started successfully.

```typescript
export default abstract class StartupCheckService extends BaseService {
  abstract isMicroserviceStarted(): PromiseErrorOr<null>;
}
```

`StartupCheckServiceImpl` is the default implementation that checks if database is initialized and jobs are scheduled.
If you need to make additional checks, implement a class that extends the `StartupCheckServiceImpl` class and provide implementations for function `isMicroserviceStarted`.
Your implementation for the function should first call the base class method and then execute additional checks.

Instantiate `StartupCheckServiceImpl` or your own class and store it as a field in your `MicroserviceImpl` class:

```typescript
export default class MicroserviceImpl extends Microservice {
  private readonly startupCheckService = new StartupCheckServiceImpl();
}
```

### <a name="auditloggingservice"></a> AuditLoggingService

This service is called to log requests made to the microservice.

```typescript
export default abstract class AuditLoggingService {
  abstract async log(auditLogEntry: AuditLogEntry): Promise<void>;
}

export type UserOperationResult = 'success' | 'failure';

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
```

Implement a class that extends the `AuditLoggingService` class and provide implementations for function:

- log

Instantiate your class and store it as a field in your `MicroserviceImpl` class:

```typescript
export default class MicroserviceImpl extends Microservice {
  private readonly auditLogService = new AuditLogServiceImpl();
}
```
