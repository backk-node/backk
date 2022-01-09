## Directory Structure

Here is the suggested directory structure for a Backk microservice:

```
- src
  |- services
  |  |- common
  |  |- service1
  |  |  |- errors
  |  |  |- types
  |  |  |  |- args
  |  |  |  |- entities 
  |  |  |  |- enum
  |  |  |  |- responses
  |  |  |- Service1.ts
  |  |  |- Service1Impl.ts
  |  |- service2
  |  |- .
  |  |- .
  |  |- serviceN
  |- microservice.ts
  |- main.ts
```
