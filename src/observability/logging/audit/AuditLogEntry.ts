import { Resource } from '../LogEntry';

export type UserOperationResult = 'success' | 'failure'

export interface AuditLogEntry {
  Timestamp: string;
  TraceId?: string;
  SpanId?: string;
  TraceFlags?: number;
  subject: string;
  clientIp: string;
  authorizationHeader: string;
  userOperation: {
    name: string,
    result: UserOperationResult,
    statusCode: number,
    errorMessage: string
  }
  Resource: Resource;
  Attributes?: { [key: string]: string | number | boolean | undefined };
}
