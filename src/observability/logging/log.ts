/* eslint-disable @typescript-eslint/camelcase */
import { LogEntry } from './LogEntry';
import * as fs from 'fs';
import tracerProvider from '../distributedtracinig/tracerProvider';
import getTimeZone from '../../utils/getTimeZone';
import getServiceName from '../../utils/getServiceName';
import { Values } from '../../constants/constants';

export enum Severity {
  DEBUG = 5,
  INFO = 9,
  WARN = 13,
  ERROR = 17,
  FATAL = 21
}

export const severityNameToSeverityMap: { [key: string]: number } = {
  DEBUG: Severity.DEBUG,
  INFO: Severity.INFO,
  WARN: Severity.WARN,
  ERROR: Severity.ERROR,
  FATAL: Severity.FATAL
};

const cwd = process.cwd();
const serviceName = getServiceName();
const packageJson = fs.readFileSync(cwd + '/package.json', { encoding: 'UTF-8' });
const packageObj = JSON.parse(packageJson);

if (
  process.env.NODE_ENV !== 'development' &&
  (!process.env.NODE_NAME || !process.env.SERVICE_NAMESPACE || !process.env.SERVICE_INSTANCE_ID)
) {
  throw new Error(
    'NODE_NAME, SERVICE_NAMESPACE and SERVICE_INSTANCE_ID environment variables must be defined'
  );
}

let lastLoggedErrorName = '';
let lastLoggedTimeInMillis = Date.now();
let lastSpanId: string | undefined = '';

export default function log(
  severityNumber: Severity,
  name: string,
  body: string,
  attributes?: { [key: string]: string | number | boolean | undefined | object[] }
) {
  const minLoggingSeverityNumber = severityNameToSeverityMap[process.env.LOG_LEVEL ?? 'INFO'];
  const now = new Date();
  const spanId = tracerProvider
    .getTracer('default')
    .getCurrentSpan()
    ?.context().spanId;

  if (severityNumber >= minLoggingSeverityNumber) {
    const logEntry: LogEntry = {
      Timestamp: now.valueOf() + '000000',
      TraceId: tracerProvider
        .getTracer('default')
        .getCurrentSpan()
        ?.context().traceId,
      SpanId: spanId,
      TraceFlags: tracerProvider
        .getTracer('default')
        .getCurrentSpan()
        ?.context().traceFlags,
      SeverityText: Severity[severityNumber],
      SeverityNumber: severityNumber,
      Name: name,
      Body: body,
      Resource: {
        'service.name': serviceName,
        'service.namespace': process.env.SERVICE_NAMESPACE ?? '',
        'service.instance.id': process.env.SERVICE_INSTANCE_ID ?? '',
        'service.version': packageObj.version,
        'node.name': process.env.NODE_NAME ?? ''
      },
      Attributes: {
        isoTimestamp: now.toISOString() + getTimeZone(),
        ...attributes
      }
    };

    if (
      lastLoggedErrorName !== name ||
      Date.now() > lastLoggedTimeInMillis + Values._100 ||
      severityNumber !== Severity.ERROR ||
      spanId !== lastSpanId
    ) {
      console.log(logEntry);
    }

    lastLoggedErrorName = name;
    lastLoggedTimeInMillis = Date.now();
    lastSpanId = spanId;
  }
}

export function logError(error: Error) {
  log(Severity.ERROR, error.message, error.stack ?? '');
}
