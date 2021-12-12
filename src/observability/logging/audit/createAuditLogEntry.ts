import fs from 'fs';
import tracerProvider from '../../distributedtracinig/tracerProvider';
import getTimeZone from '../../../utils/getTimeZone';
import getMicroserviceName from '../../../utils/getMicroserviceName';
import { AuditLogEntry, UserOperationResult } from "./AuditLogEntry";

const cwd = process.cwd();
const serviceName = getMicroserviceName();
const packageJson = fs.readFileSync(cwd + '/package.json', { encoding: 'UTF-8' });
const packageObj = JSON.parse(packageJson);

export default function createAuditLogEntry(
  subject: string,
  clientIp: string,
  authorizationHeader: string,
  userOperation: string,
  userOperationResult: UserOperationResult,
  userOperationHttpStatusCode: number,
  userOperationErrorMessage: string,
  attributes?: {
    [key: string]: string | number | boolean | undefined | object[];
  }
): AuditLogEntry {
  const now = new Date();

  return {
    subject,
    clientIp,
    authorizationHeader,
    userOperation: {
      name: userOperation,
      result: userOperationResult,
      statusCode: userOperationHttpStatusCode,
      errorMessage: userOperationErrorMessage
    },
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
      'service.namespace': process.env.MICROSERVICE_NAMESPACE ?? '',
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
