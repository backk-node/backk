## Scheduling Service Function Execution

It is possible to schedule a service function call to be executed at later stage.
The request to schedule a service function execution should be done to following HTTP endpoint:

```
POST /serviceFunctionSchedulingService.scheduleExecution
```

For the request body, you specify the service function name, argument and scheduled execution timestamp:

```json
{
  "serviceFunctionName": "reportingService.generateSalesReport",
  "serviceFunctionArgument": {
    "date": "2021-10-17",
    "region": "North-East"
  },
  "scheduledExecutionTimestamp": "2021-10-18T00:00:00+0000"
}
```

As a response you will get a `jobId`:

```
HTTP/1.1 200 OK

{
    "jobId": "234"
}
```

The implementation of `reportingService.generateSalesReport` will generate the report for a specified region for a specific date, and it should
store the generated report to data store with the job id. The job id is given to the service function `reportingService.generateSalesReport`
in the service function argument in field `_jobId`. 

So, the complete service function argument for `reportingService.generateSalesReport` will in this example be:

```json
{
  "_jobId": "234",
  "date": "2021-10-17",
  "region": "North-East"
}
```

You can then create another service function to access generated sales report by the job id:
```
POST /reportingService.getGeneratedReportByJobId
{
   "jobId": "234"
}
```
