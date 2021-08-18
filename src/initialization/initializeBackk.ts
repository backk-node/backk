import AbstractDataStore from "../datastore/AbstractDataStore";
import logEnvironment from "../observability/logging/logEnvironment";
import defaultSystemAndNodeJsMetrics from "../observability/metrics/defaultSystemAndNodeJsMetrics";
import initializeDatabase from "../datastore/sql/operations/ddl/initializeDatabase";
import reloadLoggingConfigOnChange from "../configuration/reloadLoggingConfigOnChange";
import log, { Severity } from "../observability/logging/log";
import scheduleCronJobsForExecution from "../scheduling/scheduleCronJobsForExecution";
import scheduleJobsForExecution from "../scheduling/scheduleJobsForExecution";
import StartupCheckService from "../service/startup/StartupCheckService";
import initializeCls from "../continuationlocalstorage/initializeCls";

export default async function initializeBackk(controller: any, dataStore: AbstractDataStore) {
  initializeCls();
  StartupCheckService.controller = controller;
  logEnvironment();
  defaultSystemAndNodeJsMetrics.startCollectingMetrics();
  await initializeDatabase(controller, dataStore);
  scheduleCronJobsForExecution(controller, dataStore);
  await scheduleJobsForExecution(controller, dataStore);
  reloadLoggingConfigOnChange();
  log(Severity.INFO, 'Service started', '');
}
