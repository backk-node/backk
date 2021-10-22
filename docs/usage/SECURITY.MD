## Security

- [Authorization](#authorization)
- [Encryption and Hashing](#encryptionandhashing)

### <a name="authorization"></a> Authorization

For authorizing users requests, you can use either [AuthorizationService](../api/BASE_SERVICES.MD#authorizationservice)
or [JwtAuthorizationServiceImpl](../api/BASE_SERVICES.MD#jwtauthorizationserviceimpl)

### <a name="encryptionandhashing"></a> Encryption and Hashing
Entity properties can be encrypted in database when they are annotated with `@Encrypted()` annotation.

Entity properties can be hashed in database when they are annotated with `@Hashed()` annotation.
