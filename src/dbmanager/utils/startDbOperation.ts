import log, { Severity } from "../../observability/logging/log";
import AbstractDbManager from "../AbstractDbManager";

export default function startDbOperation(dbManager: AbstractDbManager, dbManagerOperationName: string): number {
  log(Severity.DEBUG, 'Database manager operation', dbManager.constructor.name + '.' + dbManagerOperationName);
  return Date.now();
}
