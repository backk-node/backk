import log, { Severity } from "../../observability/logging/log";
import AbstractDataStore from "../AbstractDataStore";

export default function startDbOperation(dataStore: AbstractDataStore, dataStoreOperationName: string): number {
  log(Severity.DEBUG, 'Database manager operation', dataStore.constructor.name + '.' + dataStoreOperationName);
  return Date.now();
}
