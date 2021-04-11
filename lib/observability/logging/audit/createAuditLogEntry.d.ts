import { AuditLogEntry, UserOperation, UserOperationResult } from "./AuditLogEntry";
export default function createAuditLogEntry(userName: string, clientIp: string, authorizationHeader: string, userOperation: UserOperation | string, userOperationResult: UserOperationResult, userOperationHttpStatusCode: number, userOperationErrorMessage: string, attributes?: {
    [key: string]: string | number | boolean | undefined | object[];
}): AuditLogEntry;
