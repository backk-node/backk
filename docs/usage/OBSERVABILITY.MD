## Observability

- [Implement Liveness, Readiness and Startup Checks for Kubernetes Container Probes](#probes)
- [Logging](#logging)
  - [Changing Logging Level](#changeloglevel)
- [Distributed Tracing with Jaeger](#distributedtracing)
- [Prometheus Metrics](#metrics)
  - [Default Metrics](#defaultmetrics)
  - [Collecting Custom Metrics](#custommetrics)

### <a name="probes"></a> Implement Liveness, Readiness and Startup Checks for Kubernetes Container Probes

Backk microservice Kubernetes deployment defines liveness, readiness and startup probes.

The default implementation of liveness and readiness checks in Backk microservice is to return HTTP status
`200 OK`.

The default implementation of startup check is to return HTTP status `200 OK` when the data store is initialized.
When the data store initialization is pending, startup check will return HTTP status `503 Service Unavailable`.

You can implement your custom liveness, readiness and startup checks, please refer to documentation
of `LivenessCheckService`, `ReadinessCheckService` and `StartupCheckService` [here.](../api/BASE_SERVICES.MD)

### <a name="logging"></a> Logging

To write a log entry, use Backk's `log` function.

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

The log output to console will be according to [OpenTelemetry specification](https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/logs/data-model.md)

Example log entry:

```json
{
  "Timestamp": "1634636053446000000",
  "TraceId": "undefined",
  "SpanId": "undefined",
  "TraceFlags": "undefined",
  "SeverityText": "INFO",
  "SeverityNumber": 9,
  "Name": "HTTP server started, listening to port 3000",
  "Body": "",
  "Resource": {
    "service.name": "backk-example-microservice",
    "service.namespace": "default",
    "service.instance.id": "backk-example-microservice-87ffab3-xx567",
    "service.version": "1.0.53",
    "node.name": "my-kube-cluster-worker-node-04"
  },
  "Attributes": { "isoTimestamp": "2021-10-19T09:34:13.446Z+03:00" }
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

`Attributes` object contains always `isoTimestamp` of the log event and any other attributes as was supplied
to `log` function in `attributes` argument.

#### <a name="changeloglevel"></a> Changing Log Level

### <a name="distributedtracing"></a> Distributed Tracing with Jaeger

### <a name="metrics"></a> Prometheus Metrics

#### <a name="defaultmetrics"></a> Default Metrics

#### <a name="custommetrics"></a> Custom Metrics
