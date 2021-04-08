import { AuditLogEntry } from "./AuditLogEntry";

export default abstract class AuditLoggingService {
  abstract async log(auditLogEntry: AuditLogEntry): Promise<void>;
}
