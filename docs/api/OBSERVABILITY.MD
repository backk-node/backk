## Observability

- [log](#log)
- [defaultPrometheusMeter](#defaultprometheusmeter)

### <a name="log"></a> log
```ts
function log(
  severityNumber: Severity,
  name: string,
  body: string,
  attributes?: { [key: string]: string | number | boolean | undefined | object[] }
);

enum Severity {
  DEBUG = 5,
  INFO = 9,
  WARN = 13,
  ERROR = 17,
  FATAL = 21
}
```

Writes a log entry with specified severity.

Log output will be:
```json
{
  "Timestamp": "1634636053446000000",
  "TraceId": "undefined",
  "SpanId": "undefined",
  "TraceFlags": "undefined",
  "SeverityText": "INFO",
  "SeverityNumber": 9,
  "Name": <name>,
  "Body": <body>,
  "Resource": {
    "service.name": "backk-example-microservice",
    "service.namespace": "default",
    "service.instance.id": "backk-example-microservice-87ffab3-xx567",
    "service.version": "1.0.53",
    "node.name": "my-kube-cluster-worker-node-04"
  },
  "Attributes": { 
    "isoTimestamp": "2021-10-19T09:34:13.446Z+03:00",
    // your additional attributes...
  }
}
```

`Resource` object contains following:

| Property            | Description                                      |
| ------------------- | ------------------------------------------------ |
| service.name        | Name of the Backk microservice                   |
| service.namespace   | Kubernetes namespace for Backk microservice      |
| service.instance.id | Kubernetes Pod name for Backk microservice       |
| service.version     | Backk Microservice version                       |
| node.name           | Kubernetes Worker Node name where Pod is running |

`Attributes` object contains always `isoTimestamp` of the log event and any other attributes that were supplied
to `log` function in `attributes` argument.

### <a name="defaultprometheusmeter"></a> defaultPrometheusMeter

`defaultPrometheusMeter` can used to define and then collect custom metrics from your microservice.
For more information, see [Open Telemetry Metrics](https://www.npmjs.com/package/@opentelemetry/metrics)

