## Security

- [Authorization](#authorization)
- [Encryption and Hashing](#encryptionandhashing)

### <a name="authorization"></a> Authorization

For authorizing users requests, you can use either [AuthorizationService](../api/BASE_SERVICES.MD#authorizationservice)
or [JwtAuthorizationServiceImpl](../api/BASE_SERVICES.MD#jwtauthorizationserviceimpl)

### <a name="encryptionandhashing"></a> Encryption and Hashing
Entity properties can be encrypted in database when they are annotated with `@Encrypted()` annotation.
For security reasons, Backk by default encrypts entity properties that it considers as Personally Identifiable Information (PII).
If you don't want an entity property to be encrypted automatically, you can annotate the property with `@NotEncrypted` decorator.

Entity properties can be hashed in database when they are annotated with `@Hashed()` annotation.
For security reasons, Backk by defaults hashes entity properties that it considers to need hashing, e.g. `password` property.
If you don't want an entity property to be hashed automatically, you can annotate the property with `@NotHashed` decorator.

