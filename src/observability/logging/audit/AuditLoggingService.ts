import { DataStore } from '../../../datastore/DataStore';
import NullDataStore from '../../../datastore/NullDataStore';
import BaseService from '../../../services/BaseService';
import { ErrorNameToErrorDefinitionMap } from '../../../types/ErrorDefinition';
import { AuditLogEntry } from './AuditLogEntry';

export default abstract class AuditLoggingService extends BaseService {
  protected constructor(
    errorNameToErrorDefinitionMap: ErrorNameToErrorDefinitionMap = {},
    dataStore: DataStore = new NullDataStore()
  ) {
    super(errorNameToErrorDefinitionMap, dataStore);
  }

  abstract log(auditLogEntry: AuditLogEntry): Promise<void>;
}
