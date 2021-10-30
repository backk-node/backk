import { AuditLogEntry } from "./AuditLogEntry";
import BaseService from "../../../services/BaseService";

export default abstract class AuditLoggingService extends BaseService {
  constructor() {
    super({});
  }
  abstract async log(auditLogEntry: AuditLogEntry): Promise<void>;
}
