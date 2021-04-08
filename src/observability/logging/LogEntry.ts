export interface Resource {
  'service.name': string;
  'service.namespace': string;
  'service.instance.id': string;
  'service.version': string;
  'node.name': string;
}

export interface LogEntry {
  Timestamp: string;
  TraceId?: string;
  SpanId?: string;
  TraceFlags?: number;
  SeverityText: string;
  SeverityNumber: number;
  Name: string;
  Body: string;
  Resource: Resource;
  Attributes?: { [key: string]: string | number | boolean | undefined };
}
