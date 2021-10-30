import log, { Severity } from "../../observability/logging/log";
import { DataStore } from "../DataStore";

export default function startDbOperation(dataStore: DataStore, dataStoreOperationName: string): number {
  log(Severity.DEBUG, 'Database manager operation', dataStore.constructor.name + '.' + dataStoreOperationName);
  return Date.now();
}
