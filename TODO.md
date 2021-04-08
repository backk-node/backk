# Vitja service

TODO:
- getallentities should read by default all
- add/remove subentities should read all entities for given path
- @Private(isPublicInTests)
- test error cases

- remove extra deletes from deleteXXX funcs
- remove create unique index for oneToMany table
- Split to multiple microservices
- Node project for Backk: https://github.com/jsynowiec/node-typescript-boilerplate
- Starter projects:
   http-kubernetes-mysql,
   http-kubernetes-postgresql
   http-kubernetes-mongodb
   kafka-kubernetes-mysql...
   redis-kubernetes-mysql...

- In @Tests to give remoteServiceUrl and test if that url was called with expected result, 
  remote services will keep hashmap of calls by url and argument
- MongoDb optimize removePrivateProperties to use projection
- Create serviceClientImplGenerator that generates client service implementation that use backk-client library
  to fetch data
- Create backk-client library
  - call Backk.setBearerToken() to set globally for Authorization header
  - sets If-none-match header for GET requests
  - Removes readonly properties
  - performs validation


- remove hanging dbInitialization table entries that are not initialized and are 5 minutes ago or older
https://stackoverflow.com/questions/58434389/typescript-deep-keyof-of-a-nested-object
Split services to different microservices
- Create notification-service
    - Sales item cron job: send email at 16:00 if sales item is going to be removed
- Remote Http service integration tests:
  - COnfigure @Before tasks: eg. Order service tests should first do following:
    -initialize Sales item service with integration_uuid, creates a new temp database for test usage
    -create a sample sales item
    -execute Order service tests
    -@After task: remote Sales item temp database is destroyed
- Kafka sendTo integration tests, create topic name with uuid postfix, use that and delete topic at end of testing
- Redis sendTo integeration tests, create db/topic name with uuid postfix, use that and delete topic at end of testing
- mysql2 distributed tracing
- Default loginService, signUpService, passwordReset service
    - Login route, check Referer header exists and domain ending is correct, eg. https://<something>.domain.com
    - User, add role field, joka voi olla createUserissa vain "user"
    - userName should be capitalized when comparing existence
    - userName should checked first that it does not exist (case-insensitive)
    - loginService hook to perform eg. account validation email sending
    - 2-factor authentication, browser fingerprinting
- Optimoi sivutus, jos order by:tä ei ole annettu ja default order by on by _id:
    https://en.wikipedia.org/wiki/Select_(SQL)#Method_with_filter_(it_is_more_sophisticated_but_necessary_for_very_big_dataset)
- Support for analytics aggregated queries, aggregations (function name, fieldname), group by, filters
    - Put analytics query inside its service and enabled for 'management' role for u
- Add Avro schema generation and content type support (avro-js)

- Backk-frontend automatically create a frontend for one or more backends
  - backend metadata fetch urls are given in env variable as parameter

Release 3:
- Create opentelemetry kafkajs plugin
- Create opentelemetry mysql2 plugin
- gRPC support (convert using protobufjs toObject)
  - generate typescript classes from .proto IDL files
- Add support for POstgreSql/MySql CHECK and DEFAULT, GENERATED ALWAYS AS column constraint in CREATE TABLE
- For javascript CEP: http://alasql.org/
  - Read a kafka consumer batch and put in in-memory table and perform sql and
    update in memory hash table for values and every 1 minute put data to cassandra
    
-https://hasura.io/
