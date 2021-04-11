import { AuditLogEntry } from "./AuditLogEntry";
export default abstract class AuditLoggingService {
    abstract log(auditLogEntry: AuditLogEntry): Promise<void>;
}
