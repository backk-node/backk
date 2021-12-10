import { AuditLogEntry } from "./AuditLogEntry";

export interface AuditLoggingService {
  log(auditLogEntry: AuditLogEntry): Promise<void>;
}
