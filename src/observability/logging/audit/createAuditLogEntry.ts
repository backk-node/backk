import fs from 'fs';
import tracerProvider from '../../distributedtracinig/tracerProvider';
import getTimeZone from '../../../utils/getTimeZone';
import getServiceName from '../../../utils/getServiceName';
import { AuditLogEntry, UserOperation, UserOperationResult } from "./AuditLogEntry";

const cwd = process.cwd();
const serviceName = getServiceName();
const packageJson = fs.readFileSync(cwd + '/package.json', { encoding: 'UTF-8' });
const packageObj = JSON.parse(packageJson);

export default function createAuditLogEntry(
  userName: string,
  clientIp: string,
  authorizationHeader: string,
  userOperation: UserOperation | string,
  userOperationResult: UserOperationResult,
  userOperationHttpStatusCode: number,
  userOperationErrorMessage: string,
  attributes?: {
    [key: string]: string | number | boolean | undefined | object[];
  }
): AuditLogEntry {
  const now = new Date();

  return {
    userName,
    clientIp,
    authorizationHeader,
    userOperation,
    userOperationResult,
    userOperationHttpStatusCode,
    userOperationErrorMessage,
    Timestamp: now.valueOf() + '000000',
    TraceId: tracerProvider
      .getTracer('default')
      .getCurrentSpan()
      ?.context().traceId,
    SpanId: tracerProvider
      .getTracer('default')
      .getCurrentSpan()
      ?.context().spanId,
    TraceFlags: tracerProvider
      .getTracer('default')
      .getCurrentSpan()
      ?.context().traceFlags,
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
}
