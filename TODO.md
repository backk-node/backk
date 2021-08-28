# Vitja service

TODO:
- add/remove subentities should read all entities for given path
- test error cases
- remove extra deletes from deleteXXX funcs
- remove create unique index for oneToMany table
- Split to multiple microservices

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
- Optimoi sivutus, jos order by:tä ei ole annettu ja default order by on by _id:
    https://en.wikipedia.org/wiki/Select_(SQL)#Method_with_filter_(it_is_more_sophisticated_but_necessary_for_very_big_dataset)
- Support for analytics aggregated queries, aggregations (function name, fieldname), group by, filters
    - Put analytics query inside its service and enabled for 'management' role for u
- Add Avro schema generation and content type support (avro-js)

- Backk-auto-frontend
  - backend metadata fetch urls are given in env variable as parameter
  
- Logo: https://app.brandmark.io/v3/#logo_data=%7B%22keywords%22%3A%22Backk%22%2C%22id%22%3A%22logo-aed986af-8ec1-438f-921e-76298c4550c8%22%2C%22layout%22%3A0%2C%22title%22%3A%22clax%22%2C%22titleFamily%22%3A%22Comfortaa%20Bold%20Alt2%22%2C%22titleVariant%22%3A%22700%22%2C%22titleColor%22%3A%5B%7B%22hex%22%3A%22%23006afe%22%2C%22location%22%3A0%7D%2C%7B%22hex%22%3A%22%23ff8a00%22%2C%22location%22%3A0.5%7D%2C%7B%22hex%22%3A%22%23fa3200%22%2C%22location%22%3A0.75%7D%2C%7B%22hex%22%3A%22%23fbaa3b%22%2C%22location%22%3A1%7D%5D%2C%22titleScale%22%3A3.6%2C%22titleLetterSpace%22%3A0%2C%22titleLineSpace%22%3A1.1%2C%22titleBoldness%22%3A0%2C%22titleX%22%3A0%2C%22titleY%22%3A0%2C%22titleAlign%22%3A%22center%22%2C%22slogan%22%3A%22%22%2C%22sloganFamily%22%3A%22Montserrat%22%2C%22sloganVariant%22%3A%22400%22%2C%22sloganColor%22%3A%5B%7B%22hex%22%3A%22%23fa3200%22%7D%5D%2C%22sloganScale%22%3A1%2C%22sloganLetterSpace%22%3A0%2C%22sloganLineSpace%22%3A1.1%2C%22sloganBoldness%22%3A0%2C%22sloganAlign%22%3A%22center%22%2C%22sloganX%22%3A0%2C%22sloganY%22%3A0%2C%22icon%22%3Anull%2C%22showIcon%22%3Afalse%2C%22iconScale%22%3A1%2C%22iconColor%22%3A%5B%7B%22hex%22%3A%22%23ff8a00%22%7D%5D%2C%22iconContainer%22%3Anull%2C%22showIconContainer%22%3Afalse%2C%22iconContainerScale%22%3A1%2C%22iconContainerColor%22%3A%5B%7B%22hex%22%3A%22%23fbaa3b%22%7D%5D%2C%22iconSpace%22%3A1%2C%22iconX%22%3A0%2C%22iconY%22%3A0%2C%22nthChar%22%3A0%2C%22container%22%3Anull%2C%22showContainer%22%3Afalse%2C%22containerScale%22%3A1%2C%22containerColor%22%3A%5B%7B%22hex%22%3A%22%23fbaa3b%22%7D%5D%2C%22containerX%22%3A0%2C%22containerY%22%3A0%2C%22backgroundColor%22%3A%5B%7B%22hex%22%3A%22%23ffffff%22%7D%5D%2C%22palette%22%3A%5B%22%23ffffff%22%2C%22%23006afe%22%2C%22%23ff8a00%22%2C%22%23fa3200%22%2C%22%23fbaa3b%22%5D%7D
- Create opentelemetry kafkajs plugin
- Create opentelemetry mysql2 plugin
- gRPC support (convert using protobufjs toObject)
  - generate typescript classes from .proto IDL files
- Add support for POstgreSql/MySql CHECK and DEFAULT, GENERATED ALWAYS AS column constraint in CREATE TABLE
- For javascript CEP: http://alasql.org/
  - Read a kafka consumer batch and put in in-memory table and perform sql and
    update in memory hash table for values and every 1 minute put data to cassandra
    
-https://hasura.io/
