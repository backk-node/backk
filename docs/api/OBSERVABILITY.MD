### Observability

- [log](#log)
- [defaultPrometheusMeter](#defaultprometheusmeter)

#### <a name="log"></a> log
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

#### <a name="defaultprometheusmeter"></a> defaultPrometheusMeter

`defaultPrometheusMeter` can used to define and then collect custom metrics from your microservice.
For more information, see [Open Telemetry Metrics](https://www.npmjs.com/package/@opentelemetry/metrics)

