## Observability

- [Implement Liveness, Readiness and Startup Checks for Kubernetes Probes](#probes)
- [Logging](#logging)
  - [Changing Logging Level](#changelogginglevel)
- [Distributed Tracing with Jaeger](#distributedtracing)
- [Prometheus Metrics](#metrics)
  - [Default Metrics](#defaultmetrics)
  - [Collecting Custom Metrics](#custommetrics)

### <a name="probes"></a> Implement Liveness, Readiness and Startup Checks for Kubernetes Probes
Backk microservice Kubernetes deployment defines liveness, readiness and startup probes.

The default implementation of liveness and readiness checks in a Backk microservice is to return HTTP status
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

`Attributes` object contains always `isoTimestamp` of the log event and any other attributes that were supplied
to `log` function in `attributes` argument.

#### <a name="changelogginglevel"></a> Changing Logging Level
The default logging level is `INFO`.

You can change the logging level by editing Backk microservice's Kubernetes ConfigMap:
```bash
kubectl edit configmap <your-microservice-name>
```

In the text editor, change the default `INFO` value to one of the following:
- `DEBUG`
- `WARN`
- `ERROR`
- `FATAL`

Save and close the editor. The new logging level should be now effective.

### <a name="distributedtracing"></a> Distributed Tracing with Jaeger

Distributed tracing is automatically enabled in the Backk microservice by calling
`initializeDefaultJaegerTracing` function in the `src/main.ts` file.

Distributed tracing is configured with `JAEGER_AGENT_HOST` environment variable which
specifies the hostname of the Jaeger agent.

### <a name="metrics"></a> Prometheus Metrics

#### <a name="defaultmetrics"></a> Default Metrics

Backk microservice collects by default following metrics:
- process_start_timestamp_since_epoch_in_seconds
- process_active_requests_total_count
- process_open_file_descriptors_count
- process_active_handles_total_count
- process_cpu_usage_percentage
- container_memory_usage_megabytes
- container_memory_limit_megabytes
- garbage_collection_event_count
- all_service_function_calls
- service_function_calls (per service function)
- service_function_call_cache_hits (per service function)
- cached_service_function_call_responses (per service function)
- authorization_failures
- http_5xx_errors
- http_client_errors
- db_operation_errors
- db_failure_duration_in_secs
- service_function_processing_time
- db_operation_processing_time
- kafka_consumer_errors
- kafka_consumer_request_timeouts
- kafka_consumer_offset_lag
- remote_service_calls
- remote_service_call_errors
- sync_remote_service_call_http_5xx_error_responses
- sync_remote_service_call_auth_failures
- redis_consumer_error_count
- redis_consumer_queue_length

#### <a name="custommetrics"></a> Custom Metrics

Custom metrics can be created using `defaultPrometheusMeter`.

For example:

```ts
import { defaultPrometheusMeter } from 'backk';

const counter = defaultPrometheusMeter.createCounter('metric_name', {
  description: 'Example of a counter'
});

const labels = { pid: process.pid };

// Create a BoundInstrument associated with specified label values.
const boundCounter = counter.bind(labels);

boundCounter.add(10);
```

Follow [OpenTelemetry metrics documentation](https://www.npmjs.com/package/@opentelemetry/metrics) to how
to create additional metrics for your Backk microservice.
