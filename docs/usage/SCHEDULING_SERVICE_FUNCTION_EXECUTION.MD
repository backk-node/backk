## Scheduling Service Function Execution

It is possible to schedule a service function call to be executed at later stage.
The request to schedule a service function execution should be done to following HTTP endpoint:

```
POST /scheduleJobExecution
```

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

As a response you will get the `jobId`:

```
HTTP/1.1 200 OK

{
    "jobId": "234"
}
```

The `reportingService.generateSalesReport` will generate the report at specified time, and it should
store the generated report to data store with the job id. The job id is given to service function `reportingService.generateSalesReport`
inside the service function argument in field `_jobId`. 
So the complete service function argument will in the example be:

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
