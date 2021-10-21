## OWASP Top 10 Checklist

### A01:2021 – Broken Access Control

 - Violation of the principle of least privilege or deny by default, where access should only be granted for particular capabilities, roles, or users, but is available to anyone.
   - Backk microservice denies service function access by default and requires proper authorization annotation to be present for each service function, otherwise an exception is thrown
   - Backk microservice denies entity property access by default and requires a proper access control annotation to be present for each property, otherwise an exception is thrown

 - Bypassing access control checks by modifying the URL (parameter tampering or force browsing), internal application state, or the HTML page, or by using an attack tool modifying API requests.
   - Backk microservice access control checks cannot be bypassed, Backk will always check authorization based the presence and validity of JWT in HTTP or Kafka Authorization header. Authorization info is present and checked in incoming Redis message also

 - Permitting viewing or editing someone else's account, by providing its unique identifier (insecure direct object references)
   - In Backk microservice this is not possible, if service function is properly annotated with `@AllowForEveryUserForOwnResources()` decorator. 

 - Accessing API with missing access controls for POST, PUT and DELETE
   - Backk microservice does not differentiate access control handling based on used HTTP method. It handles access control in similar fashion regardless of HTTP method

 - Elevation of privilege. Acting as a user without being logged in or acting as an admin when logged in as a user.
   - This is not in scope of a Backk microservice. Logging of user is and should be handled by a 3rd party IAM solution (for example Keycloak) which is tested and secured against this kind of problems.

 - Metadata manipulation, such as replaying or tampering with a JSON Web Token (JWT) access control token, or a cookie or hidden field manipulated to elevate privileges or abusing JWT invalidation.
   - Replaying of JWT is not possible, because all traffic between external client and Backk microservice and between Backk microservices is protected by TLS. TLS protection is handled in Kubernetes cluster by API Gateway for external traffic and by a service mesh for mTLS between Backk microservices
   - JWT cannot be manipulated because it is signed, JWT expiration is also checked by Backk microservice access control. Expired JTWs are not accepted as valid JWTs by a Backk microservice.
   - **NOTE! Web Clients that want to store JWTs to the session storage inthe  web browser MUST ENCRYPT the JWT, otherwise installed malicious 3rd party JavaScript libraries can read session storage and abuse the JWT**
   
 - CORS misconfiguration allows API access from unauthorized/untrusted origins
   - This should not be applicable because all backends and APIs should be accessed through the Kubernetes Ingress and API Gateway. All backends and APIs shall then have the same FQDN of the Kubernetes cluster edge nodes.
   
### A02:2021 – Cryptographic Failures
