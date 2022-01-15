## Security Features

- Authentication and Authorization
  - End-user Authentication and Authorization is done by a separate 3rd party service
    - Backk microservices never handle end-user credentials by themselves which minimizes the risk of compromising them.
  - Mandatory service and service function access control
    - Each service function must be annotated with at least one authorization decorator, like `@AllowForEveryUser`
  - Mandatory entity property access control
    - Backk requires that each entity property has an access control decorator, like `@Private` or `@ReadWrite`

- Encryption
  - Automatic personally identifiable information (PII) encryption and hashing in data store
    - Backk will automatically encrypt a database table column using AES-256-CBC, if its name implies personally identifiable information (PII).
    - Backk will automatically hash password fields with Argon2
    - In production environment, Backk will assert that encryption key is long and strong enough

- Denial of service (DoS) and Regular Expression Denial of Service (ReDoS) prevention
  - Request rate limiting
    - Backk microservice comes with a default configuration of rate limiting at Kubernetes cluster edge for Ambassador Edge Stack
  - Mandatory request content maximum length checking
    - It is mandatory to provide a value for maximum request content length in environment variable `MAX_REQUEST_CONTENT_LENGTH_IN_BYTES`
  - Mandatory numeric value range limitation
    - It is mandatory to define a value range for a numeric property
  - Streaming JSON parsing
    - Using streaming JSON parsing does not block the Node.js event loop in case of a long request
  - Mandatory string maximum length limitation
    - It is mandatory to define maximum length for a string property
  - Captcha requirement in create operations
    - Create operations in Backk services derived from `CrudEntityService` base class require a captcha token to be present by default, this can be disabled with `@NoCaptcha()` decorator
  - Mandatory pagination
    - In Backk data store operation, it is mandatory to provide pagination information to prevent client requesting too much data. 
  - Allow only current, next or previous page pagination
    - You define with an option that you allow clients to request only current, next or previous page to be fetched. Fetching a random page is not allowed.
  - Safer Regular expression handling
    - Backk uses [RE2](https://github.com/uhop/node-re2/) from Google which can prevent from Regular Expression Denial of Service (ReDoS) attacks
  
- Input validation
  - Service function argument validation
    - Each property of service function argument must have a proper validator  
    - Service function call arguments are always validated so that unwanted input never comes to your service function implementation

- Audit logging to external service
  - Backk comes with a built-in solution where you can easily implement to send the audit logs to your external system

- Databases
  - MongoDB cannot be run without authentication in production environment
  - In production environment, Backk will assert that database password is long and strong enough
  
- SQL injection and data sniffing prevention
  - Service function response validation
    - Backk validates the response object or the first object of the response array about to be sent to the client, in order to mitigate possible SQL injection attacks that might return unwanted and invalid information from database
  - Backk data store operations don't require writing SQL statements
  - Backk data store operations internally always use SQL prepared statements
  - Backk always validates input given to SQL ORDER BY clause that they can contain only valid column names and sort direction
  - Backk always validates input given to SQL LIMIT/OFFSET clause that they can contain only numbers
  - Backk validates the requested column names in SQL SELECT statements and does not return any columns that are not specified in Entity class as readable
  - Backk never allows non-readable entity fields to be used in user defined (= client originated) query filters
  - Backk never allows by default non-readable entity fields to be used in sorting

- System internal info leakage prevention
  - Backk microservice never report exception call stack as part of request error response. Call stack is reported only when running microservice in non-production environment.
  
- Safe logging
  Backk provide safe logging where it filters out unwanted log entries. Such log entries are the ones where log entry contains secrets like passwords or personally identifiable information (PII)  


